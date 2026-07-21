import Link from 'next/link';
import type { PropsWithChildren } from 'react';

interface SidebarProps extends PropsWithChildren {
  className?: string;
}

export default function Sidebar({ className, children }: SidebarProps) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="flex-shrink-0 flex items-center px-4 h-16">
        <span className="text-xl font-semibold text-indigo-600">Interview Prep</span>
      </div>
      <nav className="mt-6 space-y-2">
        <Link
          href="/dashboard"
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
        >
          Dashboard
        </Link>
        <Link
          href="/interview"
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
        >
          New Interview
        </Link>
        <Link
          href="/history"
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
        >
          History
        </Link>
        <Link
          href="/profile"
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
        >
          Profile
        </Link>
        <Link
          href="/templates"
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
        >
          Templates
        </Link>
        <Link
          href="/admin"
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
        >
          Management
        </Link>
      </nav>
      {children}
    </div>
  );
}
