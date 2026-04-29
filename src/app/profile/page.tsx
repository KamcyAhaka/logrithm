'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Github, 
  ShieldCheck, 
  CreditCard, 
  Calendar,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ProfileContent = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'profile', 'latest');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile(snap.data());
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-12 space-y-12">
      <header className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img 
            src={user.photoURL || ''} 
            alt={user.displayName || ''} 
            className="relative w-32 h-32 rounded-3xl object-cover border border-white/10"
          />
        </div>
        <div className="text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight">{user.displayName}</h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest border border-primary/20">
              {profile?.plan || 'Free'} Plan
            </span>
          </div>
          <p className="text-white/40 font-mono text-sm leading-none">@{profile?.githubLogin || 'unknown'}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Info */}
        <div className="space-y-6">
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">Account Details</h2>
          <div className="glass-card rounded-2xl divide-y divide-white/5 overflow-hidden">
            <InfoRow 
              icon={<ShieldCheck size={18} className="text-primary" />} 
              label="Account ID" 
              value={user.uid.slice(0, 8) + '...'} 
            />
            <InfoRow 
              icon={<Calendar size={18} className="text-white/40" />} 
              label="Joined" 
              value={new Date(user.metadata.creationTime || '').toLocaleDateString()} 
            />
            <InfoRow 
              icon={<CreditCard size={18} className="text-white/40" />} 
              label="Billing Cycle" 
              value="None" 
            />
          </div>
        </div>

        {/* Connections */}
        <div className="space-y-6">
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">Connections</h2>
          <div className="glass-card rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Github size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">GitHub</p>
                <p className="text-xs text-primary font-mono select-all">{profile?.githubLogin}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-primary">
              <span>Connected</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-white/20 hover:text-white/40 transition-colors cursor-pointer">
          <Settings size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
        </div>
        <button 
          onClick={() => logout()}
          className="flex items-center space-x-2 text-red-400/50 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center justify-between p-6">
    <div className="flex items-center space-x-4">
      {icon}
      <span className="text-sm font-medium text-white/60">{label}</span>
    </div>
    <span className="text-sm font-mono text-white/50">{value}</span>
  </div>
);

export default function ProfilePage() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="pt-16 min-h-screen flex flex-col bg-[#0A0A0A] pb-20">
        <ProfileContent />
      </div>
    </AuthProvider>
  );
}
