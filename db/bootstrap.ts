import { getCollections } from '@/db';

let indexPromise: Promise<void> | null = null;

export async function ensureMongoIndexes() {
  if (!indexPromise) {
    indexPromise = (async () => {
      const {
        users,
        interviewTemplates,
        interviewSessions,
        interviewQuestions,
        interviewAnswers,
        interviewFeedback,
      } = await getCollections();

      await Promise.all([
        users.createIndex({ email: 1 }, { unique: true }),
        interviewTemplates.createIndex({ name: 1 }),
        interviewSessions.createIndex({ userId: 1, createdAt: -1 }),
        interviewSessions.createIndex({ interviewType: 1, createdAt: -1 }),
        interviewQuestions.createIndex({ sessionId: 1, questionOrder: 1 }),
        interviewAnswers.createIndex({ questionId: 1 }),
        interviewAnswers.createIndex({ sessionId: 1 }),
        interviewFeedback.createIndex({ sessionId: 1 }, { unique: true }),
      ]);
    })();
  }

  return indexPromise;
}
