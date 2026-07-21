'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

type ProfileForm = {
  role: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  graduationYear: string;
  skills: string;
  experience: string;
  projects: string;
  resumeUrl: string;
  careerGoal: string;
  currentPassword: string;
  newPassword: string;
};

export default function Profile() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>({
    role: 'student',
    name: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    graduationYear: '',
    skills: '',
    experience: '',
    projects: '',
    resumeUrl: '',
    careerGoal: '',
    currentPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (response.ok && data.user) {
          setForm(current => ({
            ...current,
            role: data.user.role || 'student',
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            college: data.user.college || '',
            branch: data.user.branch || '',
            graduationYear: data.user.graduationYear ? String(data.user.graduationYear) : '',
            skills: Array.isArray(data.user.skills) ? data.user.skills.join(', ') : '',
            experience: data.user.experience || '',
            projects: data.user.projects || '',
            resumeUrl: data.user.resumeUrl || '',
            careerGoal: data.user.careerGoal || '',
          }));
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile().catch(console.error);
  }, []);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: form.role,
          name: form.name,
          email: form.email,
          phone: form.phone,
          college: form.college,
          branch: form.branch,
          graduationYear: form.graduationYear,
          skills: form.skills,
          experience: form.experience,
          projects: form.projects,
          resumeUrl: form.resumeUrl,
          careerGoal: form.careerGoal,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setMessage('Profile updated successfully');
      setForm(current => ({
        ...current,
        currentPassword: '',
        newPassword: '',
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF file for parsing.');
      return;
    }

    setParsing(true);
    setMessage('Parsing resume with AI... Please wait.');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Pdf = e.target?.result as string;
        
        const response = await fetch('/api/resume/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Pdf }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to parse resume');
        }

        const parsed = data.data;
        setForm(current => ({
          ...current,
          skills: Array.isArray(parsed.skills) ? parsed.skills.join(', ') : parsed.skills || current.skills,
          experience: parsed.experience || current.experience,
          projects: parsed.projects || current.projects,
        }));

        setMessage('Resume parsed successfully! Please review the extracted data and save your profile.');
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to parse resume');
    } finally {
      setParsing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 text-white">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Profile</p>
            <h1 className="mt-3 text-3xl font-bold">Complete your candidate profile</h1>
            <p className="mt-2 text-slate-300">
              Keep your personal, academic, and career details up to date so the platform can personalize interviews.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 hover:bg-white/5"
          >
            Back
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-indigo-400/30 bg-indigo-900/10 p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-indigo-300">AI Resume Parsing</h2>
            <p className="mt-1 text-sm text-slate-300">
              Upload your resume (PDF) and our AI will automatically extract your skills, experience, and projects to fill the fields below.
            </p>
          </div>
          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleResumeUpload}
              disabled={parsing}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <button
              disabled={parsing}
              className="pointer-events-none rounded-full bg-indigo-600 px-5 py-3 font-medium text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {parsing ? 'Parsing AI...' : 'Upload & Parse Resume'}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Role">
            <select
              value={form.role}
              onChange={event => updateField('role', event.target.value)}
              className={inputClassName}
            >
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
              <option value="placement_officer">Placement Officer</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Name">
            <input value={form.name} onChange={event => updateField('name', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={event => updateField('email', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={event => updateField('phone', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="College">
            <input value={form.college} onChange={event => updateField('college', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Branch">
            <input value={form.branch} onChange={event => updateField('branch', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Graduation Year">
            <input value={form.graduationYear} onChange={event => updateField('graduationYear', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Skills">
            <input value={form.skills} onChange={event => updateField('skills', event.target.value)} className={inputClassName} placeholder="React, Node.js, SQL" />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Experience">
            <textarea value={form.experience} onChange={event => updateField('experience', event.target.value)} rows={3} className={inputClassName} />
          </Field>
          <Field label="Projects">
            <textarea value={form.projects} onChange={event => updateField('projects', event.target.value)} rows={3} className={inputClassName} />
          </Field>
          <Field label="Resume URL">
            <input value={form.resumeUrl} onChange={event => updateField('resumeUrl', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Career Goal">
            <textarea value={form.careerGoal} onChange={event => updateField('careerGoal', event.target.value)} rows={3} className={inputClassName} />
          </Field>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Field label="Current Password">
            <input
              type="password"
              value={form.currentPassword}
              onChange={event => updateField('currentPassword', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="New Password">
            <input
              type="password"
              value={form.newPassword}
              onChange={event => updateField('newPassword', event.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>

        {message && <p className="mt-4 text-sm text-indigo-200">{message}</p>}

        <div className="mt-8">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="rounded-full bg-indigo-500 px-5 py-3 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  'mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500';
