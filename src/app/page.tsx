'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Github, Code, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { useAuth, AuthProvider } from '@/hooks/useAuth';

const LandingContent = () => {
  const router = useRouter();
  const { signIn, loading } = useAuth();

  const handleGitHubLogin = async () => {
    try {
      await signIn();
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 flex flex-col items-center text-center space-y-12 max-w-5xl mx-auto z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold tracking-widest uppercase text-primary font-mono">
            <span>● open source</span>
            <span className="opacity-30">•</span>
            <span>free to use</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">
            Your commit history. <br />
            <span className="text-primary">Analyzed.</span>
          </h1>
          
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Connect your GitHub. Logrithm reads your activity log and runs the algorithm — 
            surfacing patterns, strengths, and blind spots you didn&apos;t know were there.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center space-x-3 transition-all hover:bg-white/90 active:scale-95"
          >
            <Github size={20} />
            <span>Connect GitHub</span>
          </button>
          
          <button
            onClick={() => router.push('/dashboard?demo')}
            className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/20 text-white font-bold rounded-xl flex items-center justify-center space-x-3 transition-all hover:bg-white/5 active:scale-95"
          >
            <span>Try demo</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="w-full pt-12 animate-in">
          <TerminalWindow username="demo-dev" />
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 max-w-5xl mx-auto px-4 w-full">
        <div className="mb-12">
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 mb-8">What Logrithm Sees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard 
              icon={<div className="w-2 h-2 rounded-full bg-primary" />}
              title="Commit patterns"
              description="When you code, how often, and whether your cadence is sustainable over time."
            />
            <FeatureCard 
              icon={<div className="w-2 h-2 rounded-full bg-accent" />}
              title="Work rhythms"
              description="Your peak focus windows, sprint streaks, and recovery periods — surfaced automatically."
            />
            <FeatureCard 
              icon={<div className="w-2 h-2 rounded-full bg-blue-400" />}
              title="Language growth"
              description="How your skill footprint shifts month over month across languages and ecosystems."
            />
            <FeatureCard 
              icon={<div className="w-2 h-2 rounded-full bg-white/20" />}
              title="AI insights"
              description="Gemini reads your history and returns a coaching summary — not just numbers, but narrative."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="glass-card p-8 rounded-2xl space-y-4">
    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
      {icon}
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <AuthProvider>
      <Navbar />
      <LandingContent />
    </AuthProvider>
  );
}
