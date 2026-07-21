'use client';

import Link from 'next/link';

export default function DrivesPage() {
  const drives = [
    { id: 1, name: 'Summer Internship Mock Drive', date: '2026-08-01', status: 'Upcoming', participants: 120 },
    { id: 2, name: 'TCS Placement Prep', date: '2026-07-15', status: 'Completed', participants: 300 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Placement Officer</p>
            <h1 className="mt-2 text-3xl font-bold">Mock Placement Drives</h1>
          </div>
          <Link href="/dashboard" className="rounded-full bg-white/10 px-5 py-2 hover:bg-white/20 transition">
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 flex justify-end">
          <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-medium transition text-sm">
            + Schedule New Drive
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Drive Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Participants</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((drive) => (
                <tr key={drive.id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-medium text-white">{drive.name}</td>
                  <td className="px-6 py-4">{new Date(drive.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      drive.status === 'Completed' ? 'bg-slate-500/20 text-slate-300' : 'bg-green-500/20 text-green-300'
                    }`}>
                      {drive.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{drive.participants} registered</td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-400 hover:text-indigo-300">Manage</button>
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
