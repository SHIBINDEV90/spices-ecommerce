'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { CheckCircle, Route, ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Only clear once the user officially lands on the session callback without refiring.
    if (sessionId && !cleared) {
      clearCart();
      setCleared(true);
    }
  }, [sessionId, cleared, clearCart]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Visual Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-lg bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-10 text-center relative z-10 shadow-2xl"
      >
        <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 shadow-inner">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Payment Confirmed</h1>
        <p className="text-gray-400 mb-2 leading-relaxed">
          Your order has been successfully locked in via Stripe and routed to the export fulfillment center.
        </p>
        <div className="font-mono text-xs bg-black/40 p-3 rounded-xl border border-white/5 text-gray-500 mb-10 overflow-x-auto">
          Reference: <span className="text-emerald-400">{sessionId}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/products" className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition-colors group">
            <ShoppingCart className="w-6 h-6 text-gray-400 group-hover:text-white mb-2 transition-colors" />
            <span className="text-sm font-medium text-gray-300">Keep Shopping</span>
          </Link>
          <Link href="/admin/orders" className="flex flex-col items-center justify-center bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 p-4 rounded-xl transition-colors group">
            <Route className="w-6 h-6 text-orange-400 group-hover:text-orange-300 mb-2 transition-colors" />
            <span className="text-sm font-medium text-orange-400">Track Fulfillment</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
