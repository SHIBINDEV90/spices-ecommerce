'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, MapPin, ArrowRight, Clock } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { getQuickDeliveryWindow } from '@/lib/geo';

export default function QuickCommerceBanner() {
  const { location, setIsModalOpen } = useLocation();
  const [deliveryWindow, setDeliveryWindow] = useState(() => getQuickDeliveryWindow());

  useEffect(() => {
    setDeliveryWindow(getQuickDeliveryWindow());
    const interval = setInterval(() => {
      setDeliveryWindow(getQuickDeliveryWindow());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 my-3 md:my-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-emerald-800 to-primary text-white p-4 sm:p-5 md:px-6 md:py-4 shadow-lg">
        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                <Zap className="w-3 h-3 fill-current" />
                <span>⚡ Wayanad 35 km Quick Commerce</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-md border border-amber-300/30 text-[11px] font-bold text-amber-200">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>
                  {deliveryWindow.isAfterCutoff
                    ? 'After 5:00 PM: Next Day Delivery'
                    : 'Before 5:00 PM: Same Day Delivery'}
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Fresh Spices Delivered <span className="text-amber-300 underline decoration-amber-400">Same Day</span>
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-snug">
              Dispatched directly from our <strong>Spicewizz Hub in Vythiri, Wayanad (PIN: 673576)</strong> within a 35 km radius.{' '}
              <span className="text-amber-200 font-medium">
                (Orders before 5:00 PM delivered Same Day • Orders after 5:00 PM delivered the very next day.)
              </span>
            </p>

            {/* Delivering to status */}
            <div className="pt-0.5 flex items-center gap-2 text-xs text-white/90">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
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

          <div className="flex flex-row lg:flex-col gap-2.5 shrink-0">
            <Link
              href="/quick"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 group"
            >
              <span>Explore Quick Spices</span>
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
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
