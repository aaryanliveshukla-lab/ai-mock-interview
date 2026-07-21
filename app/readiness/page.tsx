'use client';

import Link from 'next/link';

export default function ReadinessPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Placement Officer</p>
            <h1 className="mt-2 text-3xl font-bold">Placement Readiness Reports</h1>
          </div>
          <Link href="/dashboard" className="rounded-full bg-white/10 px-5 py-2 hover:bg-white/20 transition">
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 p-6">
            <h3 className="text-slate-300 text-sm font-medium uppercase tracking-wider">Batch Readiness</h3>
            <div className="mt-2 text-4xl font-bold text-white">78%</div>
            <p className="mt-2 text-sm text-green-400">+5% from last month</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 p-6">
            <h3 className="text-slate-300 text-sm font-medium uppercase tracking-wider">Top Skill</h3>
            <div className="mt-2 text-4xl font-bold text-white">React.js</div>
            <p className="mt-2 text-sm text-slate-400">85% average score</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/20 to-orange-500/10 p-6">
            <h3 className="text-slate-300 text-sm font-medium uppercase tracking-wider">Weakest Area</h3>
            <div className="mt-2 text-4xl font-bold text-white">System Design</div>
            <p className="mt-2 text-sm text-slate-400">Needs attention (45% avg)</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Detailed Reports</h2>
          <p className="text-slate-400">Mock data shown. Real reports will aggregate data from all completed student interview sessions.</p>
          <div className="mt-6 flex gap-4">
             <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg font-medium transition">Export CSV</button>
             <button className="px-4 py-2 border border-white/20 hover:bg-white/5 rounded-lg font-medium transition">Generate PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
