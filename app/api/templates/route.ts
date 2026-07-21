import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollections } from '@/db';
import { ensureMongoIndexes } from '@/db/bootstrap';
import { serializeInterviewTemplate, toObjectId } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';

async function getTokenUserId(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  return decoded?.id ?? null;
}

const defaultTemplates = [
  {
    name: 'MERN Stack Developer',
    role: 'student',
    interviewType: 'technical',
    difficulty: 'medium',
    description: 'Core full-stack interview questions for React, Node.js, Express, and MongoDB.',
    questions: [
      { questionText: 'Explain the MERN architecture.', expectedAnswer: 'React frontend, Express/Node backend, MongoDB database' },
      { questionText: 'How do React hooks work?', expectedAnswer: 'State and lifecycle behavior in functional components' },
      { questionText: 'How do you secure an Express API?', expectedAnswer: 'Auth, validation, rate limiting, sanitization' },
      { questionText: 'How do MongoDB indexes improve performance?', expectedAnswer: 'Faster lookups and query optimization' },
      { questionText: 'Describe how you would deploy a MERN app.', expectedAnswer: 'Build frontend, deploy backend, env vars, database connection' },
    ],
  },
  {
    name: 'HR Behavioral',
    role: 'student',
    interviewType: 'behavioral',
    difficulty: 'easy',
    description: 'Questions for communication, conflict resolution, teamwork, and leadership.',
    questions: [
      { questionText: 'Tell me about yourself.', expectedAnswer: 'Concise professional summary' },
      { questionText: 'Tell me about a conflict you resolved.', expectedAnswer: 'Situation, action, result' },
      { questionText: 'Why should we hire you?', expectedAnswer: 'Value proposition and fit' },
      { questionText: 'Describe a time you failed and learned something.', expectedAnswer: 'Reflection and growth' },
      { questionText: 'Where do you see yourself in 5 years?', expectedAnswer: 'Goals and alignment' },
    ],
  },
];

export async function GET() {
  try {
    await ensureMongoIndexes();
    const { interviewTemplates } = await getCollections();
    const templates = await interviewTemplates.find({}).sort({ createdAt: -1 }).toArray();

    if (templates.length === 0) {
      return NextResponse.json({ templates: defaultTemplates }, { status: 200 });
    }

    return NextResponse.json(
      { templates: templates.map(serializeInterviewTemplate) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureMongoIndexes();
    const { interviewTemplates } = await getCollections();
    const userId = await getTokenUserId(request);
    const objectId = userId ? toObjectId(userId) : null;

    const {
      name,
      role,
      interviewType,
      difficulty,
      description,
      questions,
    } = await request.json();

    if (!name || !interviewType || !difficulty || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Name, interview type, difficulty, and questions are required' },
        { status: 400 }
      );
    }

    const templateDoc = {
      _id: new ObjectId(),
      name: String(name).trim(),
      role: String(role || '').trim() || null,
      interviewType,
      difficulty: String(difficulty).trim(),
      description: String(description || '').trim() || null,
      questions: questions.map((question: any) => ({
        questionText: String(question.questionText || question.question || '').trim(),
        expectedAnswer: String(question.expectedAnswer || '').trim() || null,
      })).filter((question: { questionText: string }) => Boolean(question.questionText)),
      createdBy: objectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await interviewTemplates.insertOne(templateDoc);
    return NextResponse.json({ template: serializeInterviewTemplate(templateDoc) }, { status: 201 });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
