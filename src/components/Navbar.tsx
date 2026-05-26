"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { cartItems, isCartOpen, setIsCartOpen } = useCart();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate total items
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="bg-surface/80 backdrop-blur-md p-4 sticky top-0 z-40 shadow-sm border-b border-black/5 dark:border-white/10 transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center relative">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" onClick={closeMobileMenu}>
            <Image src="/images/logo.jpeg" alt="Spicewizz Logo" width={240} height={72} className="object-cover h-16 w-auto rounded shadow-sm" priority />
          </Link>
          
          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-foreground/80 font-medium hover:text-primary transition-colors">Home</Link>
              <Link href="/about" className="text-foreground/80 font-medium hover:text-primary transition-colors">About</Link>
              <Link href="/products" className="text-foreground/80 font-medium hover:text-primary transition-colors">Products</Link>
              <Link href="/certifications" className="text-foreground/80 font-medium hover:text-primary transition-colors">Certifications</Link>
              <Link href="/blog" className="text-foreground/80 font-medium hover:text-primary transition-colors">Journal</Link>
              <Link href="/contact" className="text-foreground/80 font-medium hover:text-primary transition-colors">Contact</Link>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="hidden md:flex items-center space-x-4 border-r border-black/10 dark:border-white/10 pr-4 mr-2">
                {session ? (
                  <button onClick={() => signOut()} className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors">Log Out</button>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors">Log In</Link>
                    <Link href="/signup" className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2 rounded-full shadow-sm hover:opacity-90 transition-opacity">Sign Up</Link>
                  </>
                )}
              </div>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-foreground hover:text-primary bg-foreground/5 hover:bg-foreground/10 px-3 md:px-4 py-2 rounded-full transition-all flex items-center gap-2 border border-black/5 dark:border-white/5"
              >
                <ShoppingCart size={20} strokeWidth={2} />
                <span className="text-sm font-semibold hidden md:inline">Cart</span>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.div
                      key={totalItems}
                      initial={{ scale: 0, y: 5 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-lg border border-surface"
                    >
                      {totalItems}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <button 
                className="md:hidden text-foreground p-2 hover:bg-foreground/5 rounded-full transition-colors flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden absolute top-full left-0 right-0 bg-surface border-b border-black/5 dark:border-white/5 shadow-xl overflow-hidden flex flex-col z-30"
            >
              <div className="flex flex-col p-6 space-y-5">
                <Link href="/" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">Home</Link>
                <Link href="/about" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">About</Link>
                <Link href="/products" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">Products</Link>
                <Link href="/certifications" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">Certifications</Link>
                <Link href="/blog" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">Journal</Link>
                <Link href="/contact" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">Contact</Link>
                
                <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col space-y-4">
                  {session ? (
                    <button onClick={() => { signOut(); closeMobileMenu(); }} className="text-left font-bold text-foreground/90 hover:text-primary transition-colors text-lg">Log Out</button>
                  ) : (
                    <>
                      <Link href="/login" onClick={closeMobileMenu} className="font-bold text-foreground/90 hover:text-primary transition-colors text-lg">Log In</Link>
                      <Link href="/signup" onClick={closeMobileMenu} className="font-bold text-center bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-sm hover:opacity-90 transition-opacity text-lg">Sign Up</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Persistent Cart Drawer UI */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
