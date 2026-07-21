import { NextRequest, NextResponse } from 'next/server';
import { getCollections } from '@/db';
import { ensureMongoIndexes } from '@/db/bootstrap';
import { verifyToken } from '@/lib/jwt';
import { toObjectId } from '@/db/schema';

function fallbackQuestions(role: string, interviewType: string, level: string, difficulty: string) {
  return [
    {
      question: `Tell me about yourself and your journey toward ${role}.`,
      expectedAnswer: 'Professional summary, motivation, and relevant experience',
    },
    {
      question: `Why are you interested in this ${interviewType} interview at ${difficulty} level?`,
      expectedAnswer: 'Motivation, fit, and understanding of the role',
    },
    {
      question: `Describe a challenging project related to ${level} experience and how you solved it.`,
      expectedAnswer: 'Problem, approach, and measurable outcome',
    },
    {
      question: 'How do you communicate complex ideas to non-technical stakeholders?',
      expectedAnswer: 'Clear explanation, empathy, and structure',
    },
    {
      question: 'Where do you see yourself in the next 3 to 5 years?',
      expectedAnswer: 'Career goals, growth, and alignment with the role',
    },
  ];
}

async function getTokenUserId(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return null;
  }
  const decoded = await verifyToken(token);
  return decoded?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const { role, experience, difficulty, interviewType = 'technical', questionCount = 5 } =
      await request.json();

    if (!role || !experience || !difficulty) {
      return NextResponse.json(
        { error: 'Role, experience, and difficulty are required' },
        { status: 400 }
      );
    }

    let skillsContext = '';
    let projectsContext = '';

    try {
      await ensureMongoIndexes();
      const { users } = await getCollections();
      const userId = await getTokenUserId(request);
      if (userId) {
        const objectId = toObjectId(userId);
        if (objectId) {
          const user = await users.findOne({ _id: objectId });
          if (user) {
            skillsContext = user.skills?.length ? `Candidate Skills: ${user.skills.join(', ')}` : '';
            projectsContext = user.projects ? `Candidate Projects: ${user.projects}` : '';
          }
        }
      }
    } catch (dbError) {
      console.error('Failed to fetch user context for generation:', dbError);
    }

    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || '2f9448e5cf8f860b8a4685c26b610574';
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!cfApiToken || cfApiToken === 'your-cloudflare-token-here') {
      console.warn("CLOUDFLARE_API_TOKEN is missing. Using fallback questions.");
      return NextResponse.json(
        { questions: fallbackQuestions(role, interviewType, experience, difficulty).slice(0, questionCount) },
        { status: 200 }
      );
    }

    const prompt = `
      You are an expert interviewer.
      Generate exactly ${questionCount} interview questions for a ${role} candidate.
      Interview type: ${interviewType}.
      Experience level: ${experience}.
      Difficulty: ${difficulty}.
      ${skillsContext}
      ${projectsContext}

      Tailor the questions to the candidate's skills and projects if provided, while keeping them relevant to the role and interview type.
      For each question, provide a brief expected answer outline (key points to cover).

      Return JSON only in this format:
      [
        {
          "question": "string",
          "expectedAnswer": "string"
        }
      ]
      Only return the JSON array, no additional text. Do not wrap it in markdown blockquotes.
    `;

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an expert interviewer assistant that outputs strict JSON arrays without any markdown formatting.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
       const errText = await response.text();
       throw new Error(`Cloudflare API error: ${errText}`);
    }

    const resultData = await response.json();
    let responseText = resultData.result?.response || resultData.result || '';
    
    if (typeof responseText === 'object') {
      responseText = JSON.stringify(responseText);
    } else {
      responseText = String(responseText);
    }
    
    const firstBrace = responseText.indexOf('[');
    const lastBrace = responseText.lastIndexOf(']');
    if (firstBrace !== -1 && lastBrace !== -1) {
      responseText = responseText.substring(firstBrace, lastBrace + 1);
    }

    try {
      const questions = JSON.parse(responseText);
      if (Array.isArray(questions) && questions.length > 0) {
        return NextResponse.json({ questions: questions.slice(0, questionCount) }, { status: 200 });
      }
    } catch (parseError) {
      console.error('Failed to parse generated questions', responseText);
    }

    return NextResponse.json(
      { questions: fallbackQuestions(role, interviewType, experience, difficulty).slice(0, questionCount) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions. Please ensure your Cloudflare API key is valid.' },
      { status: 500 }
    );
  }
}
