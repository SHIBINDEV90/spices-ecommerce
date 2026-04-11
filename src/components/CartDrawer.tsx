"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { X, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, getCartTotal, updateQuantity, clearCart } = useCart();

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
            <div className="flex flex-col p-6 border-b border-neutral-100 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <ShoppingCart className="text-foreground" strokeWidth={2} /> Shopping Cart
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-md text-neutral-500 mt-2">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} {(cartItems.reduce((acc, item) => acc + item.quantity, 0) === 1) ? 'item' : 'items'} in your cart
              </p>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <ShoppingCart size={64} className="mb-4 text-neutral-300" />
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
                    className="flex gap-4 p-4 bg-white relative group"
                  >
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      <Image 
                        src={item.imageUrl || '/images/Cardamom.jpg'} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h4 className="text-[15px] text-foreground pr-4 mb-0.5 line-clamp-1">{item.name}</h4>
                      <p className="text-sm text-neutral-500 mb-3">100g</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-neutral-200 rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                          >
                            <span className="text-xl leading-none -mt-1">-</span>
                          </button>
                          <span className="w-8 text-center text-[15px] font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                          >
                            <span className="text-xl leading-none -mt-0.5">+</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-foreground">₹{((item.price || 500) * item.quantity).toFixed(0)}</span>
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="text-neutral-400 hover:text-neutral-600 transition-colors flex items-center"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-neutral-200 bg-neutral-50/30 flex flex-col">
                {(() => {
                  const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 500) * item.quantity), 0);
                  const freeDeliveryThreshold = 500;
                  const remainingForFreeDelivery = freeDeliveryThreshold - subtotal;
                  const progressPercentage = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

                  return (
                    <>
                      <div className="bg-[#EAE8DD] text-foreground p-4 rounded bg-opacity-70 mb-6 w-full max-w-[90%] mx-auto relative overflow-hidden">
                         <div className="relative z-10 text-center text-[13px] text-neutral-800 mb-3">
                           {remainingForFreeDelivery > 0 ? (
                             <>Add ₹{remainingForFreeDelivery.toFixed(0)} more for <strong>Free Delivery</strong></>
                           ) : (
                             <strong>You've unlocked Free Delivery! 🎉</strong>
                           )}
                         </div>
                         <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-[#317a26] transition-all duration-500 ease-out"
                             style={{ width: `${progressPercentage}%` }}
                           />
                         </div>
                      </div>

                      <div className="flex justify-between items-center mb-6">
                        <span className="text-neutral-600 text-lg">Subtotal</span>
                        <span className="text-2xl font-bold text-foreground">
                          ₹{subtotal.toFixed(0)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-center text-neutral-600 mb-5">
                        Inclusive of all taxes. Shipping calculated at checkout.
                      </p>

                      <Link href="/checkout" onClick={onClose} className="w-full bg-[#317a26] text-white font-semibold py-3.5 rounded flex items-center justify-center hover:bg-[#235e1c] transition-colors shadow-sm active:scale-95 transform duration-200">
                        Proceed to Checkout
                      </Link>

                      <button 
                        onClick={clearCart}
                        className="mt-6 text-sm font-medium text-neutral-800 hover:text-black transition-colors mx-auto block"
                      >
                        Clear Cart
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
