import type { Metadata } from 'next';
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';

const jetbrainsMonoHeading = JetBrains_Mono({ subsets: ['latin'], variable: '--font-heading' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Logrithm — Your commit history. Analyzed.',
  description:
    'Connect your GitHub and let Gemini AI surface your development patterns, strengths, and blind spots. Open source, free to try.',
  keywords: [
    'github analytics',
    'developer insights',
    'commit history',
    'gemini ai',
    'open source',
  ],
  openGraph: {
    title: 'Logrithm — Your commit history. Analyzed.',
    description:
      'AI-powered GitHub activity analysis. See your patterns, strengths, and growth areas.',
    type: 'website',
    url: 'https://logrithm.dev',
  },
};

import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('dark font-sans', inter.variable, jetbrainsMonoHeading.variable)}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Logrithm" />
      </head>
      <body
        style={{
          minHeight: '100vh',
          background: 'var(--bg-page)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ScrollToTop />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
