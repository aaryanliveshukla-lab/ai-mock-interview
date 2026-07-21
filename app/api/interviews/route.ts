import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/jwt';
import { ensureMongoIndexes } from '@/db/bootstrap';
import { getCollections } from '@/db';
import {
  serializeInterviewAnswer,
  serializeInterviewFeedback,
  serializeInterviewQuestion,
  serializeInterviewSession,
  InterviewAnswerDocument,
  toObjectId,
} from '@/db/schema';

async function getUserId(request: Request) {
  const token =
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
  if (!token) return null;
  const decoded = await verifyToken(token);
  return decoded?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    await ensureMongoIndexes();
    const { interviewSessions, interviewQuestions, interviewAnswers, interviewFeedback } =
      await getCollections();

    const token = request.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    const userId = decoded?.id ?? null;
    const objectId = userId ? toObjectId(userId) : null;

    if (!objectId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await interviewSessions
      .find({ userId: objectId })
      .sort({ createdAt: -1 })
      .toArray();

    const interviews = await Promise.all(
      sessions.map(async session => {
        const questions = await interviewQuestions
          .find({ sessionId: session._id })
          .sort({ questionOrder: 1 })
          .toArray();

        const feedback = await interviewFeedback.findOne({ sessionId: session._id });

        const questionsWithAnswers = await Promise.all(
          questions.map(async question => {
            const answer = await interviewAnswers.findOne({ questionId: question._id });
            return {
              ...serializeInterviewQuestion(question),
              answer: answer ? serializeInterviewAnswer(answer) : null,
              feedback: feedback ? serializeInterviewFeedback(feedback) : null,
            };
          })
        );

        return {
          ...serializeInterviewSession(session),
          questions: questionsWithAnswers,
        };
      })
    );

    return NextResponse.json({ interviews }, { status: 200 });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureMongoIndexes();
    const { users, interviewSessions, interviewQuestions, interviewAnswers, interviewFeedback } =
      await getCollections();
    const userId = await getUserId(request);
    const objectId = userId ? toObjectId(userId) : null;

    if (!objectId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      description,
      role,
      level,
      interviewType,
      difficulty,
      questions,
      answers,
      evaluations,
      overallFeedback,
    } = await request.json();

    const now = new Date();
    const sessionDoc = {
      _id: new ObjectId(),
      userId: objectId,
      title: String(title || 'Mock Interview Session').trim(),
      description: String(description || '').trim() || null,
      role: String(role || '').trim() || null,
      level: String(level || '').trim() || null,
      interviewType: interviewType || null,
      difficulty: String(difficulty || '').trim() || null,
      status: 'completed',
      startedAt: now,
      endedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await interviewSessions.insertOne(sessionDoc);

    const questionDocs = Array.isArray(questions)
      ? questions.map((question: any, index: number) => ({
          _id: new ObjectId(),
          sessionId: sessionDoc._id,
          questionText: String(question.question || question.questionText || '').trim(),
          questionOrder: index + 1,
          createdAt: now,
        }))
      : [];

    if (questionDocs.length > 0) {
      await interviewQuestions.insertMany(questionDocs);
    }

    const answerDocs: InterviewAnswerDocument[] = Array.isArray(answers)
      ? answers
          .map((answer: string, index: number) => {
            const questionDoc = questionDocs[index];
            if (!questionDoc) return null;
            return {
              _id: new ObjectId(),
              sessionId: sessionDoc._id,
              questionId: questionDoc._id,
              answerText: String(answer || '').trim(),
              createdAt: now,
            };
          })
          .filter((doc): doc is InterviewAnswerDocument => Boolean(doc))
      : [];

    if (answerDocs.length > 0) {
      await interviewAnswers.insertMany(answerDocs);
    }

    let sessionAverageScore = 0;

    if (overallFeedback) {
      sessionAverageScore = Number(overallFeedback.averageScore || overallFeedback.overallScore || 0);
      await interviewFeedback.insertOne({
        _id: new ObjectId(),
        sessionId: sessionDoc._id,
        overallScore: sessionAverageScore,
        strengths: Array.isArray(overallFeedback.strengths)
          ? overallFeedback.strengths.join('\n')
          : String(overallFeedback.strengths || '').trim() || null,
        improvements: Array.isArray(overallFeedback.improvements)
          ? overallFeedback.improvements.join('\n')
          : String(overallFeedback.improvements || '').trim() || null,
        createdAt: now,
      });
    } else if (Array.isArray(evaluations) && evaluations.length > 0) {
      const totalScore = evaluations.reduce((sum: number, entry: any) => sum + Number(entry?.evaluation?.score || 0), 0);
      sessionAverageScore = Math.round((totalScore / evaluations.length) * 10) / 10;
      await interviewFeedback.insertOne({
        _id: new ObjectId(),
        sessionId: sessionDoc._id,
        overallScore: sessionAverageScore,
        strengths: null,
        improvements: null,
        createdAt: now,
      });
    }

    // Update user's account result score
    if (sessionAverageScore > 0) {
      const user = await users.findOne({ _id: objectId });
      if (user) {
        const currentCount = user.interviewsCompleted || 0;
        const currentAvg = user.averageScore || 0;
        const newCount = currentCount + 1;
        const newAvg = ((currentAvg * currentCount) + sessionAverageScore) / newCount;
        
        await users.updateOne(
          { _id: objectId },
          { 
            $set: { 
              averageScore: Math.round(newAvg * 10) / 10,
              interviewsCompleted: newCount,
              updatedAt: now
            } 
          }
        );
      }
    }

    return NextResponse.json(
      {
        session: serializeInterviewSession(sessionDoc),
        questions: questionDocs.map(serializeInterviewQuestion),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
