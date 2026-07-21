'use client';

import Link from 'next/link';

export default function StudentsPage() {
  const students = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', completedInterviews: 5, avgScore: 8.2 },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', completedInterviews: 2, avgScore: 6.5 },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', completedInterviews: 8, avgScore: 9.1 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Trainer Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">My Students</h1>
          </div>
          <Link href="/dashboard" className="rounded-full bg-white/10 px-5 py-2 hover:bg-white/20 transition">
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Completed Interviews</th>
                <th className="px-6 py-4">Avg Score</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                  <td className="px-6 py-4">{student.email}</td>
                  <td className="px-6 py-4">{student.completedInterviews}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.avgScore >= 8 ? 'bg-green-500/20 text-green-300' :
                      student.avgScore >= 6 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {student.avgScore} / 10
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-400 hover:text-indigo-300">View Details</button>
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
