'use client';

import Link from 'next/link';
import { Zap, MapPin, ArrowRight, Clock, Store } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';

export default function QuickCommerceBanner() {
  const { location, setIsModalOpen } = useLocation();

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 my-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-emerald-800 to-primary text-white p-6 sm:p-8 md:p-10 shadow-xl">
        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Wayanad 35 km Quick Commerce</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Fresh Spices Delivered in <span className="text-amber-300 underline decoration-amber-400">30–60 Minutes</span>
            </h2>

            <p className="text-sm text-white/85 leading-relaxed">
              Dispatched directly from our <strong>Spicewizz Hub in Vythiri, Wayanad (PIN: 673576)</strong> to Kalpetta, Meppadi, Lakkidi, Pozhuthana, Sultan Bathery, and surrounding areas within a 35 km radius.
            </p>

            {/* Delivering to status */}
            <div className="pt-1 flex items-center gap-2 text-xs text-white/90">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Delivering to: <strong className="text-white underline">{location.city || 'Vythiri, Wayanad'}</strong>
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="ml-1 text-amber-300 hover:text-amber-200 underline font-semibold text-xs transition"
              >
                (Change Location)
              </button>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              href="/quick"
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group"
            >
              <span>Explore Quick Spices</span>
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Set Your Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
