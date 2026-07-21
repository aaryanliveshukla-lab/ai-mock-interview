import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { questions, answers } = await request.json();

    if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
      return NextResponse.json(
        { error: 'Questions and answers arrays must be provided and have the same length' },
        { status: 400 }
      );
    }

    const evaluations = [];
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || '2f9448e5cf8f860b8a4685c26b610574';
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

    for (let index = 0; index < questions.length; index += 1) {
      const questionObj = questions[index] || {};
      const question = questionObj.question || '';
      const expectedAnswer = questionObj.expectedAnswer || '';
      const userAnswer = answers[index] || '';

      if (!cfApiToken || cfApiToken === 'your-cloudflare-token-here') {
        evaluations.push({
          questionIndex: index,
          question,
          userAnswer,
          evaluation: {
            score: 5,
            feedback: {
              strengths: ['Provided an answer'],
              improvements: ['Need more detail'],
              suggestions: ['Practice answering similar questions'],
            },
          },
        });
        continue;
      }

      try {
        const prompt = `
          Evaluate the following interview answer:

          Question: ${question}
          Expected answer outline: ${expectedAnswer}
          User's answer: ${userAnswer}

          Return JSON only in this format:
          {
            "score": number,
            "feedback": {
              "strengths": ["string"],
              "improvements": ["string"],
              "suggestions": ["string"]
            }
          }
          Only return the JSON, no additional text. Do not wrap it in markdown blockquotes.
        `;

        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are an expert interviewer evaluator that outputs strict JSON without any markdown formatting.' },
              { role: 'user', content: prompt }
            ]
          })
        });

        if (!response.ok) {
           throw new Error('Cloudflare API returned error: ' + await response.text());
        }

        const data = await response.json();
        let responseText = data.result?.response || data.result || '';
        
        // If Cloudflare automatically parsed the JSON response into an object
        if (typeof responseText === 'object') {
          responseText = JSON.stringify(responseText);
        } else {
          responseText = String(responseText);
        }
        
        // Extract JSON safely by finding the first { and last }
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          responseText = responseText.substring(firstBrace, lastBrace + 1);
        }
        
        const parsed = JSON.parse(responseText);

        evaluations.push({
          questionIndex: index,
          question,
          userAnswer,
          evaluation: {
            score: typeof parsed.score === 'number' ? parsed.score : 5,
            feedback: {
              strengths: Array.isArray(parsed.feedback?.strengths) ? parsed.feedback.strengths : [],
              improvements: Array.isArray(parsed.feedback?.improvements) ? parsed.feedback.improvements : [],
              suggestions: Array.isArray(parsed.feedback?.suggestions) ? parsed.feedback.suggestions : [],
            },
          },
        });
      } catch (evaluationError) {
        console.error('Error evaluating question:', evaluationError);
        evaluations.push({
          questionIndex: index,
          question,
          userAnswer,
          evaluation: {
            score: 0,
            feedback: {
              strengths: [],
              improvements: ['Evaluation failed to parse'],
              suggestions: ['Try again later'],
            },
          },
        });
      }
    }

    const totalScore = evaluations.reduce((sum, entry) => sum + entry.evaluation.score, 0);
    const averageScore = Math.round((totalScore / evaluations.length) * 10) / 10;
    const allStrengths = [...new Set(evaluations.flatMap(entry => entry.evaluation.feedback.strengths))];
    const allImprovements = [...new Set(evaluations.flatMap(entry => entry.evaluation.feedback.improvements))];
    const allSuggestions = [...new Set(evaluations.flatMap(entry => entry.evaluation.feedback.suggestions))];

    return NextResponse.json(
      {
        evaluations,
        overallFeedback: {
          averageScore,
          summary: `You scored ${averageScore}/10 on average across ${evaluations.length} questions.`,
          strengths: allStrengths.slice(0, 3),
          improvements: allImprovements.slice(0, 3),
          suggestions: allSuggestions.slice(0, 3),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in evaluate-interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
