"use client";

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { cartItems } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Calculate total items
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="bg-primary p-4 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-white text-2xl font-black tracking-tight flex items-center gap-2">
            <span className="bg-white text-primary px-2 py-1 rounded-md text-sm">MC</span> Spicewizz
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="text-white/80 font-medium hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="text-white/80 font-medium hover:text-white transition-colors">About</Link>
              <Link href="/products" className="text-white/80 font-medium hover:text-white transition-colors">Products</Link>
              <Link href="/certifications" className="text-white/80 font-medium hover:text-white transition-colors">Certifications</Link>
              <Link href="/blog" className="text-white/80 font-medium hover:text-white transition-colors">Journal</Link>
              <Link href="/contact" className="text-white/80 font-medium hover:text-white transition-colors">Contact</Link>
            </div>

            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="relative text-white p-2 hover:bg-white/10 rounded-full transition-colors flex items-center"
            >
              <ShoppingBag size={24} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.div
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary"
                  >
                    {totalItems}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Persistent Cart Drawer UI */}
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
