import { ObjectId } from 'mongodb';

export const COLLECTIONS = {
  users: 'users',
  interviewTemplates: 'interview_templates',
  interviewSessions: 'interview_sessions',
  interviewQuestions: 'interview_questions',
  interviewAnswers: 'interview_answers',
  interviewFeedback: 'interview_feedback',
} as const;

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type UserRole = 'student' | 'trainer' | 'placement_officer' | 'admin';
export type InterviewType = 'technical' | 'hr' | 'managerial' | 'aptitude' | 'behavioral';

export interface UserDocument {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  role?: UserRole;
  name?: string | null;
  phone?: string | null;
  college?: string | null;
  branch?: string | null;
  graduationYear?: number | null;
  skills?: string[] | null;
  experience?: string | null;
  projects?: string | null;
  resumeUrl?: string | null;
  careerGoal?: string | null;
  averageScore?: number | null;
  interviewsCompleted?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewTemplateDocument {
  _id: ObjectId;
  name: string;
  role?: string | null;
  interviewType: InterviewType | string;
  difficulty: string;
  description?: string | null;
  questions: Array<{
    questionText: string;
    expectedAnswer?: string | null;
  }>;
  createdBy?: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewSessionDocument {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description?: string | null;
  role?: string | null;
  level?: string | null;
  interviewType?: InterviewType | string | null;
  difficulty?: string | null;
  status?: InterviewStatus | string;
  startedAt?: Date | null;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewQuestionDocument {
  _id: ObjectId;
  sessionId: ObjectId;
  questionText: string;
  questionOrder: number;
  createdAt: Date;
}

export interface InterviewAnswerDocument {
  _id: ObjectId;
  questionId: ObjectId;
  sessionId: ObjectId;
  answerText: string;
  createdAt: Date;
}

export interface InterviewFeedbackDocument {
  _id: ObjectId;
  sessionId: ObjectId;
  overallScore?: number | null;
  strengths?: string | null;
  improvements?: string | null;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole | string | null;
  name: string | null;
  phone: string | null;
  college: string | null;
  branch: string | null;
  graduationYear: number | null;
  skills: string[];
  experience: string | null;
  projects: string | null;
  resumeUrl: string | null;
  careerGoal: string | null;
  averageScore: number | null;
  interviewsCompleted: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicInterviewTemplate {
  id: string;
  name: string;
  role: string | null;
  interviewType: InterviewType | string;
  difficulty: string;
  description: string | null;
  questions: Array<{
    questionText: string;
    expectedAnswer: string | null;
  }>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicInterviewSession {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  role: string | null;
  level: string | null;
  interviewType: InterviewType | string | null;
  difficulty: string | null;
  status: InterviewStatus | string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicInterviewQuestion {
  id: string;
  sessionId: string;
  questionText: string;
  questionOrder: number;
  createdAt: string;
}

export interface PublicInterviewAnswer {
  id: string;
  questionId: string;
  sessionId: string;
  answerText: string;
  createdAt: string;
}

export interface PublicInterviewFeedback {
  id: string;
  sessionId: string;
  overallScore: number | null;
  strengths: string | null;
  improvements: string | null;
  createdAt: string;
}

export function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export function serializeUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toHexString(),
    email: user.email,
    role: user.role ?? 'student',
    name: user.name ?? null,
    phone: user.phone ?? null,
    college: user.college ?? null,
    branch: user.branch ?? null,
    graduationYear: user.graduationYear ?? null,
    skills: user.skills ?? [],
    experience: user.experience ?? null,
    projects: user.projects ?? null,
    resumeUrl: user.resumeUrl ?? null,
    careerGoal: user.careerGoal ?? null,
    averageScore: user.averageScore ?? null,
    interviewsCompleted: user.interviewsCompleted ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function serializeInterviewTemplate(
  template: InterviewTemplateDocument
): PublicInterviewTemplate {
  return {
    id: template._id.toHexString(),
    name: template.name,
    role: template.role ?? null,
    interviewType: template.interviewType,
    difficulty: template.difficulty,
    description: template.description ?? null,
    questions: template.questions.map(question => ({
      questionText: question.questionText,
      expectedAnswer: question.expectedAnswer ?? null,
    })),
    createdBy: template.createdBy ? template.createdBy.toHexString() : null,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

export function serializeInterviewSession(
  session: InterviewSessionDocument
): PublicInterviewSession {
  return {
    id: session._id.toHexString(),
    userId: session.userId.toHexString(),
    title: session.title,
    description: session.description ?? null,
    role: session.role ?? null,
    level: session.level ?? null,
    interviewType: session.interviewType ?? null,
    difficulty: session.difficulty ?? null,
    status: session.status ?? null,
    startedAt: session.startedAt ? session.startedAt.toISOString() : null,
    endedAt: session.endedAt ? session.endedAt.toISOString() : null,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export function serializeInterviewQuestion(
  question: InterviewQuestionDocument
): PublicInterviewQuestion {
  return {
    id: question._id.toHexString(),
    sessionId: question.sessionId.toHexString(),
    questionText: question.questionText,
    questionOrder: question.questionOrder,
    createdAt: question.createdAt.toISOString(),
  };
}

export function serializeInterviewAnswer(
  answer: InterviewAnswerDocument
): PublicInterviewAnswer {
  return {
    id: answer._id.toHexString(),
    questionId: answer.questionId.toHexString(),
    sessionId: answer.sessionId.toHexString(),
    answerText: answer.answerText,
    createdAt: answer.createdAt.toISOString(),
  };
}

export function serializeInterviewFeedback(
  feedback: InterviewFeedbackDocument
): PublicInterviewFeedback {
  return {
    id: feedback._id.toHexString(),
    sessionId: feedback.sessionId.toHexString(),
    overallScore: feedback.overallScore ?? null,
    strengths: feedback.strengths ?? null,
    improvements: feedback.improvements ?? null,
    createdAt: feedback.createdAt.toISOString(),
  };
}
