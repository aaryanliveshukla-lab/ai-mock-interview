'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type InterviewHistoryItem = {
  id: string;
  title: string;
  role: string | null;
  level: string | null;
  interviewType: string | null;
  difficulty: string | null;
  status: string | null;
  createdAt: string;
  questions: Array<{
    id: string;
    questionText: string;
    questionOrder: number;
    answer: { answerText: string } | null;
    feedback: {
      overallScore: number | null;
      strengths: string | null;
      improvements: string | null;
    } | null;
  }>;
};

export default function History() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch('/api/interviews');
        const data = await response.json();
        if (response.ok && Array.isArray(data.interviews)) {
          setInterviews(data.interviews);
        }
      } finally {
        setLoading(false);
      }
    }

    loadHistory().catch(console.error);
  }, []);

  const averageScore = useMemo(() => {
    const scores = interviews.flatMap(interview =>
      interview.questions
        .map(question => question.feedback?.overallScore)
        .filter((score): score is number => typeof score === 'number')
    );

    if (!scores.length) return null;
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round((total / scores.length) * 10) / 10;
  }, [interviews]);

  if (loading) {
    return <div className="text-white">Loading history...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 text-white">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Performance History</p>
            <h1 className="mt-3 text-3xl font-bold">All interview sessions</h1>
            <p className="mt-2 text-slate-300">
              Review session scores, answers, and feedback to track your improvement over time.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 hover:bg-white/5"
          >
            Dashboard
          </button>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-200">
          Average score across all reviewed answers: {averageScore != null ? `${averageScore}/10` : 'No scores yet'}
        </div>
      </section>

      {interviews.length === 0 ? (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
          No interview sessions found yet. Start one from the dashboard.
        </section>
      ) : (
        <div className="space-y-6">
          {interviews.map(interview => (
            <details
              key={interview.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{interview.title}</h2>
                    <p className="mt-1 text-sm text-slate-300">
                      {interview.role || 'General'} · {interview.level || 'Fresher'} · {interview.interviewType || 'technical'}
                    </p>
                  </div>
                  <div className="rounded-full bg-indigo-500/20 px-4 py-2 text-sm text-indigo-200">
                    {interview.questions.find(question => question.feedback?.overallScore != null)?.feedback?.overallScore != null
                      ? `${interview.questions.find(question => question.feedback?.overallScore != null)?.feedback?.overallScore}/10`
                      : 'Pending'}
                  </div>
                </div>
              </summary>

              <div className="mt-6 space-y-4">
                {interview.questions.map(question => (
                  <div key={question.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Question {question.questionOrder}
                        </p>
                        <h3 className="mt-2 text-base font-medium text-white">{question.questionText}</h3>
                      </div>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-200">
                        {question.feedback?.overallScore != null ? `${question.feedback.overallScore}/10` : 'Not scored'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl bg-white/5 p-3">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Answer</div>
                        <p className="mt-2 text-sm text-slate-200">
                          {question.answer?.answerText || 'No answer saved'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Feedback</div>
                        <p className="mt-2 text-sm text-slate-200">
                          {question.feedback?.strengths || 'Feedback not available yet'}
                        </p>
                        {question.feedback?.improvements && (
                          <p className="mt-2 text-sm text-rose-200">
                            Improve: {question.feedback.improvements}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
