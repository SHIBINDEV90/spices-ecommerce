'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, ShoppingCart, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const { cartItems, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customerEmail: email,
          customerName: name,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout Session URL
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <ShoppingCart className="w-16 h-16 text-gray-700 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">Cart is Empty</h1>
        <p className="text-gray-400 mb-8 text-center max-w-sm">You haven't added any spices to your cart yet. Head back to the shop to discover our exotic blends.</p>
        <Link href="/products" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105">
          Browse Spices
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">Secure Checkout</h1>
          <p className="text-gray-400 mt-2 flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Export-Grade Security and Verification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Order Summary Form */}
          <div className="lg:col-span-7 space-y-8 animate-in slide-in-from-left-8 duration-700">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 mb-6 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 ml-1 block mb-2">Full Name / Company Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-gray-600"
                    placeholder="E.g. Spices Importers Ltd."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 ml-1 block mb-2">Primary Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-gray-600"
                    placeholder="contact@company.com"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">Receipts and shipping coordinates will be sent to this channel.</p>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-lg hover:from-orange-400 hover:to-amber-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-orange-500/20 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>Proceed to Payment Gateway <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-600 mt-4 flex items-center justify-center gap-1">
                    Powered securely by <span className="font-semibold text-gray-400 text-[#635BFF] flex items-center gap-1 mx-1">Stripe</span>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-5 animate-in slide-in-from-right-8 duration-700">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl sticky top-24">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                <ShoppingCart className="w-5 h-5 text-orange-400" /> Order Registry
              </h2>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate truncate-lines-1">{item.name}</h4>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right pl-2">
                      <p className="font-bold text-emerald-400">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>International Shipping</span>
                  <span className="text-amber-400 text-xs mt-1">Calculated at next step</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-white/10">
                  <span className="text-lg font-bold">Total Pay</span>
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
