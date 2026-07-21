'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, this would fetch from an admin API route.
  // For the mockup, we will just simulate loading and display some static data.
  useEffect(() => {
    setTimeout(() => {
      setUsers([
        { id: '1', name: 'Admin User', email: 'admin@ai-mock.com', role: 'admin', createdAt: new Date().toISOString() },
        { id: '2', name: 'John Doe', email: 'john@college.edu', role: 'student', createdAt: new Date().toISOString() },
        { id: '3', name: 'Dr. Smith', email: 'smith@college.edu', role: 'trainer', createdAt: new Date().toISOString() },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">User Management</h1>
          </div>
          <Link href="/dashboard" className="rounded-full bg-white/10 px-5 py-2 hover:bg-white/20 transition">
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading users...</div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-medium text-white">{user.name || 'Unnamed'}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button className="text-rose-400 hover:text-rose-300 text-xs font-medium uppercase tracking-wider">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
