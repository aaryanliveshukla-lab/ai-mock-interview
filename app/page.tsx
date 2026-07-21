'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (simplified)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null; // This component will redirect immediately
}