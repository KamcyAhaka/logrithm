'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, User, Bell, GitBranch } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const navigation = [
  { name: 'Privacy & Visibility', href: '/settings/privacy', icon: Shield },
  { name: 'Repositories', href: '/settings/repositories', icon: GitBranch },
  { name: 'Account', href: '/settings/account', icon: User },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#0a0a0a] font-sans text-white/70">
      <Navbar />

      <div className="mx-auto mt-4 flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 md:mt-8 md:flex-row md:p-8">
        <aside className="shrink-0 md:w-56">
          <div className="sticky top-24">
            <Link
              href="/dashboard"
              className="mb-6 flex items-center gap-2 px-3 font-mono text-xs text-white/40 transition-colors hover:text-[#1D9E75] md:mb-8"
            >
              ← return to dashboard
            </Link>
            <h2 className="mb-4 hidden px-3 font-mono text-xs font-medium tracking-widest text-white/40 uppercase md:block">
              Settings
            </h2>
            <nav className="scrollbar-hide mb-6 flex space-x-2 overflow-x-auto border-b border-white/10 pb-4 md:mb-0 md:flex-col md:space-y-1 md:space-x-0 md:border-b-0 md:pb-0">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm whitespace-nowrap transition-colors md:rounded-none md:border-l-2 ${
                      isActive
                        ? 'border-[#1D9E75] bg-white/5 text-[#1D9E75] md:bg-transparent'
                        : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/70 md:hover:bg-transparent'
                    }`}
                  >
                    <item.icon
                      size={16}
                      className={isActive ? 'text-[#1D9E75]' : 'text-white/40'}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="max-w-2xl min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
