import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logrithm — Your commit history. Analyzed.",
  description: "AI-Powered GitHub Activity Analyzer. Get insights into your development patterns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} font-sans min-h-full bg-background text-foreground antialiased`}
      >
        <Suspense fallback={null}>
          <main className="flex-1 flex flex-col">{children}</main>
        </Suspense>
      </body>
    </html>
  );
}
