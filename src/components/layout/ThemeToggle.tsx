'use client';

import { useTheme } from '@/components/theme/ThemeProvider';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)]"
        aria-hidden="true"
      >
        <div className="h-3.5 w-3.5 opacity-0" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-std)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-all duration-200 hover:border-[#1D9E75]/50 hover:text-[#1D9E75] hover:shadow-[0_0_12px_rgba(29,158,117,0.2)] focus-visible:ring-1 focus-visible:ring-[#1D9E75] focus-visible:outline-none"
        >
          {theme === 'system' ? (
            <Monitor className="h-3.5 w-3.5 transition-transform duration-200 hover:rotate-12" />
          ) : resolvedTheme === 'dark' ? (
            <Moon className="h-3.5 w-3.5 transition-transform duration-200 hover:-rotate-12" />
          ) : (
            <Sun className="h-3.5 w-3.5 transition-transform duration-200 hover:rotate-45" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-36 rounded-xl border border-[var(--border-std)] bg-[var(--bg-card)] p-1.5 font-mono text-xs shadow-xl backdrop-blur-md"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors focus:bg-[var(--border-subtle)] focus:text-[var(--text-primary)] ${
            theme === 'light'
              ? 'bg-[#1D9E75]/10 font-semibold text-[#1D9E75]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </div>
          {theme === 'light' && <Check className="h-3.5 w-3.5 text-[#1D9E75]" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors focus:bg-[var(--border-subtle)] focus:text-[var(--text-primary)] ${
            theme === 'dark'
              ? 'bg-[#1D9E75]/10 font-semibold text-[#1D9E75]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </div>
          {theme === 'dark' && <Check className="h-3.5 w-3.5 text-[#1D9E75]" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors focus:bg-[var(--border-subtle)] focus:text-[var(--text-primary)] ${
            theme === 'system'
              ? 'bg-[#1D9E75]/10 font-semibold text-[#1D9E75]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5" />
            <span>System</span>
          </div>
          {theme === 'system' && <Check className="h-3.5 w-3.5 text-[#1D9E75]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
