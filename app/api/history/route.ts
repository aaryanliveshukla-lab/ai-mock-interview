import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { ensureMongoIndexes } from '@/db/bootstrap';
import { getCollections } from '@/db';
import {
  serializeInterviewAnswer,
  serializeInterviewFeedback,
  serializeInterviewQuestion,
  serializeInterviewSession,
  toObjectId,
} from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    await ensureMongoIndexes();
    const {
      interviewSessions,
      interviewQuestions,
      interviewAnswers,
      interviewFeedback,
    } = await getCollections();

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
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
