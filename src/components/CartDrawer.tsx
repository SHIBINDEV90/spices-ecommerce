"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, getCartTotal } = useCart();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-surface z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <ShoppingBag className="text-primary" /> Your Cart
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <ShoppingBag size={64} className="mb-4 text-neutral-300" />
                  <p className="text-xl font-semibold mb-2">Your cart is empty</p>
                  <p className="text-sm">Looks like you haven't added any premium spices yet.</p>
                  <button 
                    onClick={onClose}
                    className="mt-6 text-primary font-bold hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item._id} 
                    className="flex gap-4 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm relative group"
                  >
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                      <Image 
                        src={item.imageUrl || '/images/Cardamom.jpg'} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-grow justify-center">
                      <h4 className="font-bold text-foreground line-clamp-1">{item.name}</h4>
                      <p className="text-sm text-secondary mb-2">Qty: {item.quantity}</p>
                      <p className="font-bold text-primary mt-auto">₹{((item.price || 500) * item.quantity).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-neutral-500 font-semibold text-lg">Subtotal</span>
                  <span className="text-2xl font-bold text-foreground">
                    ₹{(cartItems.reduce((acc, item) => acc + ((item.price || 500) * item.quantity), 0)).toFixed(2)}
                  </span>
                </div>
                <Link href="/bulk-enquiry" onClick={onClose} className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors shadow-lg active:scale-95 transform duration-200">
                  Proceed to Quote <ArrowRight size={20} />
                </Link>
                <p className="text-xs text-center text-neutral-400 mt-4">
                  Final shipping and taxes will be calculated at quoting stage.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
