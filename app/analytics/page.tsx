'use client';

import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Placement Officer</p>
            <h1 className="mt-2 text-3xl font-bold">Placement Analytics</h1>
          </div>
          <Link href="/dashboard" className="rounded-full bg-white/10 px-5 py-2 hover:bg-white/20 transition">
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 h-64 flex flex-col items-center justify-center">
            <p className="text-slate-400 mb-2">Performance Trend (Chart Placeholder)</p>
            <div className="w-full max-w-xs h-32 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/5 flex items-end px-4 gap-2">
               <div className="w-full bg-indigo-500/50 rounded-t-sm" style={{ height: '40%' }}></div>
               <div className="w-full bg-indigo-500/70 rounded-t-sm" style={{ height: '60%' }}></div>
               <div className="w-full bg-indigo-500/90 rounded-t-sm" style={{ height: '75%' }}></div>
               <div className="w-full bg-indigo-400 rounded-t-sm" style={{ height: '90%' }}></div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 h-64 flex flex-col items-center justify-center">
            <p className="text-slate-400 mb-2">Skill Distribution (Chart Placeholder)</p>
            <div className="w-32 h-32 rounded-full border-8 border-indigo-500 border-r-purple-500 border-b-emerald-500 border-l-rose-500 opacity-80"></div>
          </div>
        </div>
        
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
           <h2 className="text-xl font-semibold mb-2">Actionable Insights</h2>
           <ul className="list-disc pl-5 text-slate-300 space-y-2 mt-4">
             <li><strong className="text-white">Communication Skills:</strong> 30% of students in the current batch scored below average in HR rounds. Recommend scheduling a communication workshop.</li>
             <li><strong className="text-white">Technical Prowess:</strong> Data Structures scores have improved by 15% since the last mock drive.</li>
             <li><strong className="text-white">Engagement:</strong> 85% of registered students completed at least one AI mock interview this week.</li>
           </ul>
        </div>
      </div>
    </div>
  );
}
