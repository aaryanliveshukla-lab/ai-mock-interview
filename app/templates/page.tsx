'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Template = {
  id?: string;
  name: string;
  role: string | null;
  interviewType: string;
  difficulty: string;
  description: string | null;
  questions: Array<{ questionText: string; expectedAnswer: string | null }>;
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Template>({
    name: '',
    role: 'student',
    interviewType: 'technical',
    difficulty: 'medium',
    description: '',
    questions: [
      { questionText: '', expectedAnswer: '' },
    ],
  });

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();
        if (response.ok && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
      } finally {
        setLoading(false);
      }
    }

    loadTemplates().catch(console.error);
  }, []);

  const updateQuestion = (index: number, field: 'questionText' | 'expectedAnswer', value: string) => {
    setForm(current => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      ),
    }));
  };

  const addQuestion = () => {
    setForm(current => ({
      ...current,
      questions: [...current.questions, { questionText: '', expectedAnswer: '' }],
    }));
  };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save template');
      }
      setTemplates(current => [data.template, ...current]);
      setForm({
        name: '',
        role: 'student',
        interviewType: 'technical',
        difficulty: 'medium',
        description: '',
        questions: [{ questionText: '', expectedAnswer: '' }],
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading templates...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 text-white">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Templates</p>
            <h1 className="mt-3 text-3xl font-bold">Create interview templates</h1>
            <p className="mt-2 text-slate-300">
              Trainers and placement officers can store reusable question sets for different interview rounds.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 hover:bg-white/5"
          >
            Dashboard
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
            placeholder="Template name"
            className={inputClassName}
          />
          <input
            value={form.role || ''}
            onChange={event => setForm(current => ({ ...current, role: event.target.value }))}
            placeholder="Role"
            className={inputClassName}
          />
          <select
            value={form.interviewType}
            onChange={event => setForm(current => ({ ...current, interviewType: event.target.value }))}
            className={inputClassName}
          >
            {['technical', 'hr', 'managerial', 'aptitude', 'behavioral'].map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={form.difficulty}
            onChange={event => setForm(current => ({ ...current, difficulty: event.target.value }))}
            className={inputClassName}
          >
            {['easy', 'medium', 'hard'].map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <textarea
            value={form.description || ''}
            onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
            placeholder="Description"
            rows={3}
            className={inputClassName}
          />
        </div>

        <div className="mt-6 space-y-4">
          {form.questions.map((question, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={question.questionText}
                  onChange={event => updateQuestion(index, 'questionText', event.target.value)}
                  placeholder={`Question ${index + 1}`}
                  className={inputClassName}
                />
                <input
                  value={question.expectedAnswer || ''}
                  onChange={event => updateQuestion(index, 'expectedAnswer', event.target.value)}
                  placeholder="Expected answer"
                  className={inputClassName}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            Add Question
          </button>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={saveTemplate}
            disabled={saving}
            className="rounded-full bg-indigo-500 px-5 py-3 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {templates.map(template => (
          <article key={template.id || template.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{template.name}</h2>
                <p className="mt-1 text-sm text-slate-300">
                  {template.role || 'General'} · {template.interviewType} · {template.difficulty}
                </p>
              </div>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-200">
                {template.questions.length} questions
              </span>
            </div>
            {template.description && <p className="mt-3 text-sm text-slate-300">{template.description}</p>}
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {template.questions.slice(0, 3).map((question, index) => (
                <li key={index}>• {question.questionText}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500';
