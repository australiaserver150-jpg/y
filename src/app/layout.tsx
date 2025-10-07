import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ConnectNow',
  description: 'Real-time chat with AI-powered smart replies.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
