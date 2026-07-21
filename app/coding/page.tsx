'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';

const problems = [
  {
    id: 1,
    title: 'Reverse A String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters.',
    language: 'javascript',
    initialCode: 'function reverseString(s) {\n  // Write your code here\n}\n',
  },
  {
    id: 2,
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    language: 'javascript',
    initialCode: 'function twoSum(nums, target) {\n  // Write your code here\n}\n',
  },
];

export default function CodingInterview() {
  const router = useRouter();
  const [problemIndex, setProblemIndex] = useState(0);
  const problem = problems[problemIndex];
  const [code, setCode] = useState(problem.initialCode);
  const [output, setOutput] = useState<string>('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const evaluateCode = async () => {
    setEvaluating(true);
    setFeedback(null);
    try {
      // Basic mock evaluation via Gemini logic (can reuse evaluate-interview endpoint or a new one)
      const response = await fetch('/api/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: [
            {
              question: `Coding Problem: ${problem.title}\nDescription: ${problem.description}`,
              expectedAnswer: 'A working algorithm that correctly solves the problem efficiently.',
            },
          ],
          answers: [code],
        }),
      });

      const data = await response.json();
      if (response.ok && data.evaluations) {
        setFeedback(data.evaluations[0].evaluation);
      } else {
        setOutput('Error evaluating code.');
      }
    } catch (error) {
      setOutput('Failed to evaluate code.');
    } finally {
      setEvaluating(false);
    }
  };

  const runCode = () => {
    // Note: Running user code directly in the browser is unsafe in real apps, 
    // but for mock/demo purposes we can try a basic evaluation if it's safe JS.
    // However, it's better to just rely on the AI evaluation for the mock platform.
    setOutput('Code execution is simulated. Click "Submit Code" for AI evaluation.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-white/10 bg-slate-900/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">AI Coding Interview</h1>
          <p className="text-sm text-slate-400">Problem: {problem.title}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium hover:bg-white/5"
        >
          Exit Interview
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2fr]">
        <aside className="border-r border-white/10 bg-slate-900/30 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-lg font-semibold">{problem.title}</h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              {problem.description}
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">Output / AI Feedback</h3>
            
            {output && (
              <div className="bg-black/50 p-4 rounded-xl font-mono text-sm text-slate-300 mb-4 whitespace-pre-wrap">
                {output}
              </div>
            )}

            {feedback && (
              <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300">AI Score</span>
                  <span className="bg-indigo-500/20 text-indigo-200 px-2 py-1 rounded-full text-xs">{feedback.score}/10</span>
                </div>
                
                <div>
                  <span className="text-xs text-slate-400 uppercase">Strengths</span>
                  <ul className="text-sm text-slate-200 mt-1 pl-4 list-disc">
                    {feedback.feedback.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                
                <div>
                  <span className="text-xs text-slate-400 uppercase">Improvements</span>
                  <ul className="text-sm text-slate-200 mt-1 pl-4 list-disc">
                    {feedback.feedback.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
            
            {evaluating && (
              <div className="flex items-center gap-3 text-indigo-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
                AI is reviewing your code...
              </div>
            )}
          </div>
        </aside>

        <main className="flex flex-col relative h-[calc(100vh-80px)]">
          <div className="flex-1 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={problem.language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          
          <div className="bg-slate-900 border-t border-white/10 p-4 flex justify-end gap-3">
            <button
              onClick={runCode}
              className="rounded-full border border-white/15 px-6 py-2 text-sm font-medium hover:bg-white/5"
            >
              Run Code
            </button>
            <button
              onClick={evaluateCode}
              disabled={evaluating}
              className="rounded-full bg-indigo-500 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              Submit Code
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
