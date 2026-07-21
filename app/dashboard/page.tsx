'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserProfile = {
  id: string;
  email: string;
  role: string;
  name: string | null;
  phone: string | null;
  college: string | null;
  branch: string | null;
  graduationYear: number | null;
  skills: string[];
  experience: string | null;
  projects: string | null;
  resumeUrl: string | null;
  careerGoal: string | null;
  createdAt: string;
  updatedAt: string;
};

type InterviewSummary = {
  id: string;
  title: string;
  role: string | null;
  level: string | null;
  interviewType: string | null;
  difficulty: string | null;
  status: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  questions: Array<{
    id: string;
    questionText: string;
    answer: { answerText: string } | null;
    feedback: { overallScore: number | null } | null;
  }>;
};

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const [profileResponse, interviewsResponse] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/history'),
        ]);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (mounted && profileData.user) {
            setProfile(profileData.user);
          }
        }

        if (interviewsResponse.ok) {
          const interviewsData = await interviewsResponse.json();
          if (mounted && Array.isArray(interviewsData.interviews)) {
            setInterviews(interviewsData.interviews);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard().catch(console.error);

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const completed = interviews.filter(interview => interview.status === 'completed').length;
    const averageScore = interviews.length
      ? Math.round(
          interviews.reduce((sum, interview) => {
            const score =
              interview.questions.find(question => question.feedback?.overallScore != null)
                ?.feedback?.overallScore ?? 0;
            return sum + score;
          }, 0) / interviews.length
        )
      : 0;

    return {
      completed,
      averageScore,
      totalInterviews: interviews.length,
      role: profile?.role ? profile.role.toLowerCase() : 'student',
    };
  }, [interviews, profile?.role]);

  const recentInterviews = interviews.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (!profile) {
    router.push('/login');
    return null;
  }

  const renderStudentDashboard = () => (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Profile</h2>
              <p className="mt-1 text-sm text-slate-300">
                Role: <span className="font-medium text-white capitalize">{stats.role.replace('_', ' ')}</span>
              </p>
            </div>
            <Link
              href="/profile"
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
            >
              Edit Profile
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['College', profile.college],
              ['Branch', profile.branch],
              ['Phone', profile.phone],
              ['Graduation Year', profile.graduationYear?.toString() ?? null],
              ['Experience', profile.experience],
              ['Career Goal', profile.careerGoal],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                <div className="mt-2 text-sm text-slate-100">{value || 'Not added yet'}</div>
              </div>
            ))}
          </div>

          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Skills</div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span
                    key={skill}
                    className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <p className="mt-1 text-sm text-slate-300">
                Start a new session or review your interview history.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Technical Round',
                desc: 'DSA, system design, and role-specific questions.',
                href: '/interview?type=technical',
              },
              {
                title: 'HR Round',
                desc: 'Behavioral, communication, and culture-fit prompts.',
                href: '/interview?type=hr',
              },
              {
                title: 'Managerial Round',
                desc: 'Leadership, prioritization, and conflict resolution.',
                href: '/interview?type=managerial',
              },
              {
                title: 'Coding Interview',
                desc: 'In-browser code execution and AI evaluation.',
                href: '/coding',
              },
              {
                title: 'AI Career Coach',
                desc: 'Get personalized career roadmaps and advice.',
                href: '/career-coach',
              },
            ].map(action => (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-indigo-400/50 hover:bg-slate-900"
              >
                <div className="text-lg font-semibold">{action.title}</div>
                <p className="mt-2 text-sm text-slate-300">{action.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Recent Sessions</h2>
          <div className="mt-4 space-y-4">
            {recentInterviews.length === 0 ? (
              <p className="text-sm text-slate-300">
                No sessions yet. Start your first mock interview to see progress here.
              </p>
            ) : (
              recentInterviews.map(session => {
                const score =
                  session.questions.find(question => question.feedback?.overallScore != null)
                    ?.feedback?.overallScore ?? null;
                return (
                  <div key={session.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-white">{session.title}</div>
                        <p className="text-sm text-slate-300">
                          {session.role || 'General'} · {session.level || 'All levels'}
                        </p>
                      </div>
                      <div className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-200">
                        {score != null ? `${score}/10` : 'Pending'}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 text-xs text-slate-400">
                      <span>{session.interviewType || 'technical'}</span>
                      <span>•</span>
                      <span>{session.difficulty || 'medium'}</span>
                      <span>•</span>
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 p-6">
          <h2 className="text-xl font-semibold">Readiness Snapshot</h2>
          <p className="mt-2 text-sm text-slate-200">
            Use this dashboard to understand interview readiness across technical,
            HR, and behavioral rounds.
          </p>
          <div className="mt-4 rounded-2xl bg-slate-950/50 p-4 text-sm text-slate-200">
            Your next best step: {stats.totalInterviews === 0 ? 'complete one technical interview' : 'review feedback and attempt a harder round'}.
          </div>
        </section>
      </aside>
    </div>
  );

  const renderTrainerDashboard = () => (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Trainer Dashboard</h2>
        <p className="mt-2 text-slate-300">Monitor student progress and create interview templates.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/students" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-indigo-400/50">
            <h3 className="text-lg font-semibold">My Students</h3>
            <p className="mt-2 text-sm text-slate-400">View performance and track improvement.</p>
          </Link>
          <Link href="/templates" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-indigo-400/50">
            <h3 className="text-lg font-semibold">Interview Templates</h3>
            <p className="mt-2 text-sm text-slate-400">Create custom interview formats.</p>
          </Link>
        </div>
      </section>
    </div>
  );

  const renderPlacementDashboard = () => (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Placement Cell Dashboard</h2>
        <p className="mt-2 text-slate-300">Track student readiness and generate reports.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link href="/readiness" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-indigo-400/50">
            <h3 className="text-lg font-semibold">Readiness Reports</h3>
            <p className="mt-2 text-sm text-slate-400">View batch placement readiness scores.</p>
          </Link>
          <Link href="/drives" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-indigo-400/50">
            <h3 className="text-lg font-semibold">Mock Drives</h3>
            <p className="mt-2 text-sm text-slate-400">Conduct mass mock interview drives.</p>
          </Link>
          <Link href="/analytics" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-indigo-400/50">
            <h3 className="text-lg font-semibold">Placement Analytics</h3>
            <p className="mt-2 text-sm text-slate-400">Analyze overall performance trends.</p>
          </Link>
        </div>
      </section>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
        <p className="mt-2 text-slate-300">Manage users, AI settings, and platform configuration.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link href="/admin/users" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-indigo-400/50">
            <h3 className="text-lg font-semibold">User Management</h3>
            <p className="mt-2 text-sm text-slate-400">Manage roles and permissions.</p>
          </Link>
          <Link href="/admin/questions" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-indigo-400/50">
            <h3 className="text-lg font-semibold">Question Bank</h3>
            <p className="mt-2 text-sm text-slate-400">Curate and manage interview questions.</p>
          </Link>
          <Link href="/admin/settings" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-indigo-400/50">
            <h3 className="text-lg font-semibold">System Settings</h3>
            <p className="mt-2 text-sm text-slate-400">Configure AI keys and platform settings.</p>
          </Link>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-950/20 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">
                AI Mock Interview Platform
              </p>
              <h1 className="mt-3 text-3xl font-bold">
                Welcome back, {profile.name ?? profile.email.split('@')[0]}
              </h1>
              <p className="mt-2 max-w-2xl text-slate-300">
                {stats.role === 'student' 
                  ? 'Continue your interview practice, track improvement, and manage your readiness for technical and HR rounds.'
                  : `You are logged in as a ${stats.role.replace('_', ' ')}. Select a tool below to continue.`
                }
              </p>
            </div>

            {stats.role === 'student' && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Interviews', value: stats.totalInterviews },
                  { label: 'Completed', value: stats.completed },
                  { label: 'Avg Score', value: stats.averageScore ? `${stats.averageScore}/10` : 'N/A' },
                ].map(card => (
                  <div key={card.label} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</div>
                    <div className="mt-2 text-2xl font-semibold">{card.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {stats.role === 'student' && renderStudentDashboard()}
        {stats.role === 'trainer' && renderTrainerDashboard()}
        {stats.role === 'placement_officer' && renderPlacementDashboard()}
        {stats.role === 'admin' && renderAdminDashboard()}

      </div>
    </div>
  );
}
