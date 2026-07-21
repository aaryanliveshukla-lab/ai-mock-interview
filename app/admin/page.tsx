'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminSnapshot = {
  role: string;
  name: string | null;
  email: string;
};

type SessionCount = {
  id: string;
  title: string;
  status: string | null;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminSnapshot | null>(null);
  const [sessions, setSessions] = useState<SessionCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [profileResponse, interviewsResponse] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/interviews'),
        ]);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.user || null);
        }

        if (interviewsResponse.ok) {
          const interviewData = await interviewsResponse.json();
          setSessions(
            Array.isArray(interviewData.interviews)
              ? interviewData.interviews.map((item: any) => ({
                  id: item.id,
                  title: item.title,
                  status: item.status,
                  createdAt: item.createdAt,
                }))
              : []
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadAdminData().catch(console.error);
  }, []);

  if (loading) {
    return <div className="text-white">Loading management center...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 text-white">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Management Center</p>
        <h1 className="mt-3 text-3xl font-bold">Admin, Trainer, and Placement workflows</h1>
        <p className="mt-2 text-slate-300">
          Use this space to review readiness, create templates, and inspect the latest interview sessions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/templates" className="rounded-full bg-indigo-500 px-5 py-3 font-medium text-white hover:bg-indigo-400">
            Manage Templates
          </Link>
          <Link href="/history" className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 hover:bg-white/5">
            Review Interviews
          </Link>
          <Link href="/dashboard" className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 hover:bg-white/5">
            Back to Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Current Role', profile?.role || 'student'],
          ['Saved Sessions', String(sessions.length)],
          ['Latest State', sessions[0]?.status || 'none'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Recent Sessions</h2>
        <div className="mt-4 space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-300">No sessions yet.</p>
          ) : (
            sessions.slice(0, 5).map(session => (
              <div key={session.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{session.title}</div>
                    <div className="text-sm text-slate-300">{new Date(session.createdAt).toLocaleString()}</div>
                  </div>
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-200">
                    {session.status || 'completed'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
