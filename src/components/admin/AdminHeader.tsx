'use client';

import Link from 'next/link';
import AdminNotificationBell from './AdminNotificationBell';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-13 sm:h-14 items-center justify-between border-b border-white/10 bg-black/85 px-6 md:px-8 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Operational</span>
        </div>
        <span className="text-gray-600 text-xs hidden sm:inline">•</span>
        <span className="text-gray-400 text-xs font-medium hidden sm:inline">
          Export &amp; Retail Console
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* Notification Bell */}
        <AdminNotificationBell />

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-white hidden sm:inline text-xs">Admin</span>
        </div>
      </div>
    </header>
  );
}
