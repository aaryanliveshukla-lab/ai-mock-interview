import Sidebar from '@/components/Sidebar';
import type { ReactNode } from 'react';

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar className="w-64 bg-white dark:bg-gray-800 border-r" />
      <div className="flex-1 flex flex-col p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">AI Mock Interview</h1>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}