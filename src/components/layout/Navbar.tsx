'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <span className="text-primary font-black text-xl">L</span>
          </div>
          <span className="font-mono font-black text-xl tracking-tighter">
            log<span className="text-primary">rithm</span>
          </span>
        </Link>

        <div className="flex items-center space-x-8">
          <div className="hidden md:flex items-center space-x-6 text-[11px] uppercase tracking-widest font-bold text-white/40">
            <Link href="/docs" className="hover:text-white transition-colors">docs</Link>
            <Link href="https://github.com" target="_blank" className="hover:text-white transition-colors">github</Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-6">
              <Link 
                href="/dashboard"
                className={`text-[11px] uppercase tracking-widest font-black transition-all ${
                  pathname === '/dashboard' ? 'text-primary' : 'text-white/40 hover:text-white'
                }`}
              >
                dashboard
              </Link>
              <Link 
                href="/profile"
                className={`relative group transition-all ${
                  pathname === '/profile' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full' : ''
                }`}
              >
                <img 
                  src={user.photoURL || ''} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-white/10 group-hover:border-white/30 transition-all"
                />
              </Link>
              <button 
                onClick={() => logout()}
                className="p-2 text-white/20 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              href="/dashboard?demo"
              className="text-[11px] uppercase tracking-widest font-black px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all"
            >
              try demo
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
