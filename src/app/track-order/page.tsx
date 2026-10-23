'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Package, 
  Truck, 
  MapPin, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Mail,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import OrderTrackingTimeline from '@/components/orders/OrderTrackingTimeline';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialOrderId = searchParams.get('orderId') || searchParams.get('id') || searchParams.get('awb') || '';

  const [query, setQuery] = useState(initialOrderId);
  const [verification, setVerification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any | null>(null);

  const fetchTracking = async (searchQuery: string, searchVerification?: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          verification: searchVerification?.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to locate order tracking details.');
      }

      setOrderData(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to locate your order. Please check the details and try again.');
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setQuery(initialOrderId);
      fetchTracking(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/track-order?orderId=${encodeURIComponent(query.trim())}`);
      fetchTracking(query, verification);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] dark:bg-zinc-950 text-neutral-800 dark:text-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase">
            <Truck className="w-3.5 h-3.5" />
            <span>SpiceWizz Live Delivery Tracker</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Track Your Spice Order
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Enter your SpiceWizz Order ID or Courier AWB Number to check the real-time status of your spice delivery.
          </p>
        </div>

        {/* Search Bar Box */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-lg shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="relative sm:col-span-7">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Order ID (e.g. 660f... or last 8 digits) or AWB #"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-zinc-800/80 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white dark:focus:bg-zinc-800 transition"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Email or Mobile (Optional)"
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-zinc-800/80 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white dark:focus:bg-zinc-800 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="w-full h-full py-3.5 px-5 rounded-2xl bg-[#2a6821] hover:bg-[#205219] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Track</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pl-1">
              Tip: You can find your Order ID in your order confirmation email or checkout success screen.
            </p>
          </form>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-sm"
            >
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Please verify that you copied the complete Order ID or courier tracking code. If you just placed your order, please allow a few minutes for registration.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tracking Details View */}
        {orderData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Main Interactive Timeline */}
            <OrderTrackingTimeline
              status={orderData.trackingStatus || 'processing'}
              history={orderData.history || []}
              shipping={orderData.shipping || {}}
              orderId={orderData.orderId}
            />

            {/* Order Items & Destination Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Items Card */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-bold text-base text-neutral-900 dark:text-white">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>Parcel Contents</span>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {orderData.products?.map((item: any, idx: number) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-sm font-bold">
                  <span className="text-neutral-600 dark:text-neutral-400">Total Invoice Amount:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-base">
                    ₹{orderData.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-base text-neutral-900 dark:text-white mb-3">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Delivery Destination</span>
                  </div>

                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {orderData.customerName}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    {[orderData.shippingCity, orderData.shippingState, orderData.shippingPostalCode].filter(Boolean).join(', ') || 'Address on file'}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Aroma-Lock Tamper Proof Delivery</span>
                  </div>
                </div>

                {/* Need Support button */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                  <span>Questions about your shipment?</span>
                  <a
                    href="https://wa.me/919447000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    WhatsApp Support &rarr;
                  </a>
                </div>
              </div>

            </div>

            {/* Back to Shopping Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/products"
                className="py-3 px-6 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-white font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-zinc-800 transition shadow-sm flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore More Wayanad Spices</span>
              </Link>

              <button
                onClick={() => fetchTracking(query, verification)}
                className="py-3 px-6 rounded-2xl bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-200 font-semibold text-sm hover:bg-neutral-200 dark:hover:bg-zinc-700 transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Live Status</span>
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf9f5] dark:bg-zinc-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2a6821]" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
