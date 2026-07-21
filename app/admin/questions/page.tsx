'use client';

import Link from 'next/link';

export default function QuestionsPage() {
  const questions = [
    { id: 1, text: 'Explain the Virtual DOM in React.', category: 'Technical', difficulty: 'Medium' },
    { id: 2, text: 'Tell me about a time you failed.', category: 'Behavioral', difficulty: 'Easy' },
    { id: 3, text: 'Design a scalable chat application.', category: 'System Design', difficulty: 'Hard' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Question Bank</h1>
          </div>
          <Link href="/dashboard" className="rounded-full bg-white/10 px-5 py-2 hover:bg-white/20 transition">
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 flex justify-end">
          <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-medium transition text-sm">
            + Add Question
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-medium text-white max-w-md truncate">{q.text}</td>
                  <td className="px-6 py-4">{q.category}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        q.difficulty === 'Hard' ? 'bg-rose-500/20 text-rose-300' :
                        q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {q.difficulty}
                      </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button className="text-indigo-400 hover:text-indigo-300">Edit</button>
                    <button className="text-rose-400 hover:text-rose-300">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
