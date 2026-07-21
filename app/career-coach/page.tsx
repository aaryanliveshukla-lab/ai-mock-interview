'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CareerCoach() {
  const router = useRouter();
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGetAdvice = async () => {
    if (!goal.trim()) {
      setError('Please enter a career goal.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Re-using generate-questions endpoint logic roughly, but we should hit a new api if we have time.
      // For now, mocking the response for the UI.
      setTimeout(() => {
        setAdvice({
          roadmap: [
            'Master core JavaScript fundamentals (Closures, Promises, Event Loop)',
            'Learn React advanced patterns (Hooks, Context, Performance)',
            'Understand Node.js architecture and Express middleware',
            'Learn MongoDB data modeling and indexing',
            'Practice System Design and microservices basics'
          ],
          recommendedSkills: ['TypeScript', 'Docker', 'AWS', 'GraphQL', 'Redis'],
          interviewStrategy: 'Focus on explaining your thought process clearly. Practice behavioral questions using the STAR method.'
        });
        setLoading(false);
      }, 1500);
      
    } catch (err) {
      setError('Failed to get career advice.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 text-white min-h-screen bg-slate-950 p-6 sm:p-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-indigo-950/20 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">AI Career Coach</p>
            <h1 className="mt-3 text-3xl font-bold">Personalized Career Guidance</h1>
            <p className="mt-2 text-slate-300">
              Tell us your career goal, and our AI will generate a customized roadmap, recommended skills, and interview strategies.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 hover:bg-white/5"
          >
            Dashboard
          </button>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-slate-200">What is your career goal?</label>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Become a Senior Full Stack Developer in 2 years"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500"
          />
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          <button
            onClick={handleGetAdvice}
            disabled={loading}
            className="mt-4 rounded-full bg-indigo-500 px-6 py-3 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? 'Analyzing Profile & Generating Roadmap...' : 'Get Career Advice'}
          </button>
        </div>
      </section>

      {advice && (
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-indigo-400/30 bg-indigo-900/10 p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-indigo-300">Your Action Plan</h2>
            <p className="mt-4 text-sm text-slate-300">{advice.interviewStrategy}</p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Learning Roadmap</h2>
            <ul className="mt-4 space-y-3">
              {advice.roadmap.map((step: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Recommended Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {advice.recommendedSkills.map((skill: string) => (
                <span key={skill} className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200">
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <h3 className="text-sm font-medium text-slate-200">Next Step:</h3>
              <p className="mt-1 text-xs text-slate-400">Update your profile with these skills once acquired to get better interview recommendations.</p>
              <button onClick={() => router.push('/profile')} className="mt-3 text-sm text-indigo-300 hover:text-indigo-200">
                Go to Profile &rarr;
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
