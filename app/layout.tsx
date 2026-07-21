import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Mock Interview',
  description: 'AI-powered mock interview platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
