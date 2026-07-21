import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyToken } from '@/lib/jwt';

const genAI = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { base64Pdf } = await request.json();
    if (!base64Pdf) {
      return NextResponse.json({ error: 'No PDF provided' }, { status: 400 });
    }

    if (!genAI) {
      return NextResponse.json({ error: 'Gemini API is not configured' }, { status: 500 });
    }

    const base64Data = base64Pdf.replace(/^data:application\/pdf;base64,/, '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Extract the following information from the provided resume PDF:
      1. A list of technical skills (array of strings)
      2. Total years of experience (string or number)
      3. A brief summary of key projects (string)
      
      Format the response strictly as a JSON object:
      {
        "skills": ["React", "Node.js"],
        "experience": "2 Years",
        "projects": "Built an AI platform using MERN stack..."
      }
      Only return the JSON, no additional text. Do not wrap it in markdown blockquotes.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'application/pdf',
        },
      },
    ]);

    let responseText = await result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(responseText);

    return NextResponse.json({ data: parsedData }, { status: 200 });
  } catch (error) {
    console.error('Resume parse error:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
