import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Logrithm — Your commit history. Analyzed.',
  description:
    'Connect your GitHub and let Gemini AI surface your development patterns, strengths, and blind spots. Open source, free to try.',
  keywords: ['github analytics', 'developer insights', 'commit history', 'gemini ai', 'open source'],
  openGraph: {
    title: 'Logrithm — Your commit history. Analyzed.',
    description: 'AI-powered GitHub activity analysis. See your patterns, strengths, and growth areas.',
    type: 'website',
    url: 'https://logrithm.dev',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
        {children}
      </body>
    </html>
  );
}
