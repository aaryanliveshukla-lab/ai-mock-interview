import dns from 'node:dns';
import { Collection, Db, MongoClient } from 'mongodb';
import {
  COLLECTIONS,
  InterviewAnswerDocument,
  InterviewFeedbackDocument,
  InterviewQuestionDocument,
  InterviewTemplateDocument,
  InterviewSessionDocument,
  UserDocument,
} from './schema';

type MongoCollections = {
  users: Collection<UserDocument>;
  interviewTemplates: Collection<InterviewTemplateDocument>;
  interviewSessions: Collection<InterviewSessionDocument>;
  interviewQuestions: Collection<InterviewQuestionDocument>;
  interviewAnswers: Collection<InterviewAnswerDocument>;
  interviewFeedback: Collection<InterviewFeedbackDocument>;
};

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
const MONGODB_DNS_SERVERS = process.env.MONGODB_DNS_SERVERS;

type GlobalMongo = typeof globalThis & {
  __mongoClientPromise?: Promise<MongoClient>;
  __mongoDbPromise?: Promise<Db>;
  __mongoCollectionsPromise?: Promise<MongoCollections>;
};

const globalForMongo = globalThis as GlobalMongo;

function configureMongoDns() {
  const servers = MONGODB_DNS_SERVERS?.split(',')
    .map(server => server.trim())
    .filter(Boolean);

  if (servers?.length) {
    dns.setServers(servers);
  }
}

function getDatabaseName() {
  if (MONGODB_DB) {
    return MONGODB_DB;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const pathname = new URL(MONGODB_URI).pathname.replace(/^\/+/, '');
  return pathname || 'ai_mock_interview';
}

async function getClient() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  if (!globalForMongo.__mongoClientPromise) {
    configureMongoDns();
    const client = new MongoClient(MONGODB_URI);
    globalForMongo.__mongoClientPromise = client.connect();
  }

  return globalForMongo.__mongoClientPromise;
}

export async function getDb() {
  if (!globalForMongo.__mongoDbPromise) {
    globalForMongo.__mongoDbPromise = getClient().then(client =>
      client.db(getDatabaseName())
    );
  }

  return globalForMongo.__mongoDbPromise;
}

export async function getCollections(): Promise<MongoCollections> {
  if (!globalForMongo.__mongoCollectionsPromise) {
    globalForMongo.__mongoCollectionsPromise = getDb().then(db => ({
    users: db.collection<UserDocument>(COLLECTIONS.users),
    interviewTemplates: db.collection<InterviewTemplateDocument>(
      COLLECTIONS.interviewTemplates
    ),
    interviewSessions: db.collection<InterviewSessionDocument>(
      COLLECTIONS.interviewSessions
    ),
      interviewQuestions: db.collection<InterviewQuestionDocument>(
        COLLECTIONS.interviewQuestions
      ),
      interviewAnswers: db.collection<InterviewAnswerDocument>(
        COLLECTIONS.interviewAnswers
      ),
      interviewFeedback: db.collection<InterviewFeedbackDocument>(
        COLLECTIONS.interviewFeedback
      ),
    }));
  }

  return globalForMongo.__mongoCollectionsPromise;
}
