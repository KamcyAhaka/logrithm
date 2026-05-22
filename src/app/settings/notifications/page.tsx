'use client';

import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="mb-2 font-sans text-2xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-white/40">Choose when Logrithm reaches out.</p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-medium text-white">Email Notifications</h2>

        <div className="mb-6 rounded-md border border-[#1D9E75]/20 bg-[#1D9E75]/10 p-3">
          <p className="text-sm font-medium text-[#1D9E75]">Email notifications are coming soon.</p>
        </div>

        <div className="pointer-events-none space-y-6 opacity-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <label className="text-sm font-medium text-white">Weekly activity digest</label>
              <p className="mt-1 text-sm text-white/40">
                A summary of your GitHub activity every Monday.
              </p>
            </div>
            <Switch checked={false} disabled />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <label className="text-sm font-medium text-white">Score changes</label>
              <p className="mt-1 text-sm text-white/40">
                Notify me when my activity score changes significantly.
              </p>
            </div>
            <Switch checked={false} disabled />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <label className="text-sm font-medium text-white">New feature announcements</label>
              <p className="mt-1 text-sm text-white/40">
                Be the first to know about new Logrithm features.
              </p>
            </div>
            <Switch checked={false} disabled />
          </div>
        </div>

        <Separator className="mt-8 mb-8 bg-white/10" />
      </section>
    </div>
  );
}
