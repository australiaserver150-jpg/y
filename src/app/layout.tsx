import type { Metadata } from 'next';
import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { CallManager } from '@/components/CallManager';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-headline' });

export const metadata: Metadata = {
  title: 'ConnectNow',
  description: 'A minimal Next.js application with real-time chat and calling.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-background`}>
        <FirebaseClientProvider>
          {children}
          <CallManager />
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
