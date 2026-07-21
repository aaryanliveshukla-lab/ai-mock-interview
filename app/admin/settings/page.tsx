'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SettingsPage() {
  const [model, setModel] = useState('gemini-1.5-pro');
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">System Settings</h1>
          </div>
          <Link href="/dashboard" className="rounded-full bg-white/10 px-5 py-2 hover:bg-white/20 transition">
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold mb-4">AI Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Default AI Model</label>
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">The model used for evaluating interviews and parsing resumes.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Gemini API Key</label>
                <input 
                  type="password" 
                  value="************************"
                  readOnly
                  className="w-full rounded-xl border border-white/10 bg-slate-900/50 p-3 text-slate-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-500">API key is managed via environment variables (.env).</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Maintenance Mode</div>
                  <div className="text-sm text-slate-400">Disable access for all non-admin users.</div>
                </div>
                <div className="h-6 w-11 rounded-full bg-slate-700 relative cursor-pointer">
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Allow Public Registration</div>
                  <div className="text-sm text-slate-400">Let anyone create a student account.</div>
                </div>
                <div className="h-6 w-11 rounded-full bg-indigo-500 relative cursor-pointer">
                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-all"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-medium transition w-full">
                Save Settings
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
