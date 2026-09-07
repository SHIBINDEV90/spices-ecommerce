'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  PackageCheck,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((sessionId || orderId) && !cleared) {
      clearCart();
      setCleared(true);
    }
  }, [sessionId, orderId, cleared, clearCart]);

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        let url = '';

        if (orderId) {
          url = `/api/checkout/order?orderId=${encodeURIComponent(orderId)}`;
        } else if (sessionId) {
          url = `/api/checkout/order?sessionId=${encodeURIComponent(sessionId)}`;
        }

        if (!url) {
          return;
        }

        const res = await fetch(url);
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (orderId || sessionId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#317a26]" />
      </div>
    );
  }

  if (!sessionId && !orderId) {
    return null;
  }

  const displayId = orderId || order?.id || sessionId;
  const isCod = order?.paymentMethod === 'cod' || (!!orderId && !sessionId);

  return (
    <div className="min-h-screen bg-[#faf9f5] pt-24 pb-24 text-neutral-800 font-sans flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-white border border-neutral-200/80 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#2a6821] to-[#317a26] text-white p-8 text-center relative">
          <div className="inline-flex items-center justify-center p-3.5 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isCod ? 'Order Placed Successfully!' : 'Payment Successful!'}
          </h1>
          <p className="text-emerald-100 text-[15px] mt-1.5 max-w-md mx-auto">
            {isCod
              ? 'Thank you for your order. We are preparing it for shipment. Please keep cash ready upon delivery.'
              : 'Thank you! Your transaction has been securely verified and your spices are being prepared for dispatch.'}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-[#fcfbf9] border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div>
              <span className="text-neutral-500 block text-xs uppercase tracking-wider font-semibold">Order Reference</span>
              <span className="font-mono font-bold text-neutral-800 text-base">
                #{displayId ? displayId.slice(-8).toUpperCase() : 'PENDING'}
              </span>
            </div>
            {paymentId && (
              <div>
                <span className="text-neutral-500 block text-xs uppercase tracking-wider font-semibold">Payment ID</span>
                <span className="font-mono text-xs text-neutral-700 font-medium">{paymentId}</span>
              </div>
            )}
            <div>
              <span className="text-neutral-500 block text-xs uppercase tracking-wider font-semibold">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-[#235e1c]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {order?.paymentStatus === 'paid' ? 'Paid & Verified' : isCod ? 'COD Confirmed' : 'Processing'}
              </span>
            </div>
          </div>

          {order && (
            <div className="space-y-4">
              <div className="border border-neutral-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-neutral-800 text-sm">
                  <Receipt className="w-4 h-4 text-[#317a26]" />
                  <span>Order Items</span>
                </div>
                <div className="divide-y divide-neutral-100">
                  {order.products?.map((item: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-sm">
                      <div className="flex-1 pr-4">
                        <span className="font-medium text-neutral-800 block">{item.name}</span>
                        <span className="text-xs text-neutral-500">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-neutral-800">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-center font-bold text-base">
                  <span>Total Amount</span>
                  <span className="text-[#317a26]">₹{order.totalAmount?.toFixed(0)}</span>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="bg-[#faf9f5] border border-neutral-200 rounded-xl p-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-neutral-800 mb-1.5">
                    <Truck className="w-4 h-4 text-[#317a26]" />
                    <span>Shipping Destination</span>
                  </div>
                  <p className="text-neutral-600">
                    {order.customerName} &bull; {order.customerEmail}
                    <br />
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4 text-sm flex gap-3 items-start">
            <PackageCheck className="w-5 h-5 text-[#317a26] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-neutral-800">What happens next?</h4>
              <p className="text-neutral-600 text-xs leading-relaxed">
                You will receive a confirmation email shortly. Our plantation partners will freshly pack your artisanal spices and dispatch them via express courier with tracking updates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/products"
              className="py-3 px-5 rounded-lg border border-neutral-300 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 text-center"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore More Spices</span>
            </Link>
            <Link
              href="/"
              className="py-3 px-5 rounded-lg bg-[#317a26] hover:bg-[#235e1c] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 text-center shadow-sm"
            >
              <span>Return to Home</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
