"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { cartItems, isCartOpen, setIsCartOpen } = useCart();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const pathname = usePathname();

  // Hide the standard user navbar completely on all admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Calculate total items
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileProductsOpen(false);
  };

  return (
    <>
      <nav className="bg-surface/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 sticky top-0 z-40 shadow-sm border-b border-black/5 dark:border-white/10 transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center relative">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" onClick={closeMobileMenu}>
            <Image src="/images/logo.jpeg" alt="Spicewizz Logo" width={240} height={72} className="object-cover h-16 w-auto rounded shadow-sm" priority />
          </Link>
          
          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="hidden md:flex space-x-6 items-center">
              <Link href="/" className="text-foreground/80 font-medium hover:text-primary transition-colors">Home</Link>
              <Link href="/about" className="text-foreground/80 font-medium hover:text-primary transition-colors">About</Link>
              <div className="relative group">
                <Link href="/products" className="text-foreground/80 font-medium hover:text-primary transition-colors py-4 flex items-center gap-1">
                  Products
                  <ChevronDown size={16} className="transition-transform duration-200 group-hover:-rotate-180" />
                </Link>
                <div className="absolute top-full left-0 w-48 bg-surface dark:bg-zinc-900 rounded-xl shadow-lg border border-black/5 dark:border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-2 mt-[-8px]">
                  {['Cardamom', 'Pepper', 'Cinnamon', 'Nutmeg', 'Mace flower', 'Star anise', 'Bay leafe', 'Honey', 'Coffee seeds'].map((item) => (
                    <Link 
                      key={item} 
                      href={`/products?filter=${encodeURIComponent(item.toLowerCase())}`}
                      className="px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-foreground/5 transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/certifications" className="text-foreground/80 font-medium hover:text-primary transition-colors">Certifications</Link>
              <Link href="/blog" className="text-foreground/80 font-medium hover:text-primary transition-colors">Journal</Link>
              <Link href="/contact" className="text-foreground/80 font-medium hover:text-primary transition-colors">Contact</Link>
              <div className="relative group">
                <button className="text-foreground/80 font-medium hover:text-primary transition-colors py-4 flex items-center gap-1">
                  Vendors
                  <ChevronDown size={16} className="transition-transform duration-200 group-hover:-rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-52 bg-surface dark:bg-zinc-900 rounded-xl shadow-lg border border-black/5 dark:border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-2 mt-[-8px]">
                  <Link 
                    href="/vendors"
                    className="px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-foreground/5 transition-colors font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    Browse Vendor Marketplace
                  </Link>
                  <div className="border-t border-black/5 dark:border-white/5 my-1" />
                  <Link 
                    href="/vendor/login"
                    className="px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-foreground/5 transition-colors"
                  >
                    Vendor Portal Login
                  </Link>
                  <Link 
                    href="/vendor/register"
                    className="px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-foreground/5 transition-colors"
                  >
                    Register as Vendor / Farmer
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="hidden md:flex items-center space-x-4 border-r border-black/10 dark:border-white/10 pr-4 mr-2">
                {session && (session.user as any)?.role === 'Customer' ? (
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
                      className="absolute -top-2 -right-2 bg-moss-deep text-white text-xs font-bold h-[22px] w-[22px] rounded-full flex items-center justify-center shadow-sm"
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
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden absolute top-full left-0 right-0 bg-surface dark:bg-zinc-900 border-b border-black/5 dark:border-white/5 shadow-xl flex flex-col z-30 max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
            >
              <div className="flex flex-col p-6 space-y-5 pb-8">
                {/* User action buttons (Login/SignUp or Logout) prominently placed at top of mobile menu */}
                <div className="pb-4 border-b border-black/10 dark:border-white/10">
                  {session && (session.user as any)?.role === 'Customer' ? (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground/90 truncate mr-2">
                        {(session.user as any)?.name || (session.user as any)?.email}
                      </span>
                      <button 
                        onClick={() => { signOut(); closeMobileMenu(); }} 
                        className="px-4 py-2 text-sm font-bold text-red-600 border border-red-200 dark:border-red-800 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                      >
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <Link 
                        href="/login" 
                        onClick={closeMobileMenu} 
                        className="text-center font-bold text-foreground/90 border border-black/15 dark:border-white/15 px-4 py-2.5 rounded-full hover:bg-foreground/5 transition-colors text-base"
                      >
                        Log In
                      </Link>
                      <Link 
                        href="/signup" 
                        onClick={closeMobileMenu} 
                        className="text-center font-bold bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-sm hover:opacity-90 transition-opacity text-base"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>

                <Link href="/" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">Home</Link>
                <Link href="/about" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">About</Link>
                <div>
                  <button 
                    onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                    className="w-full flex items-center justify-between text-foreground/90 font-medium hover:text-primary transition-colors text-lg"
                  >
                    <span>Products</span>
                    <ChevronDown size={20} className={`transform transition-transform duration-200 ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isMobileProductsOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden flex flex-col pl-4 mt-2 space-y-3 border-l border-black/10 dark:border-white/10"
                      >
                        {['Cardamom', 'Pepper', 'Cinnamon', 'Nutmeg', 'Mace flower', 'Star anise', 'Bay leafe', 'Honey', 'Coffee seeds'].map((item) => (
                          <Link 
                            key={item} 
                            href={`/products?filter=${encodeURIComponent(item.toLowerCase())}`}
                            onClick={closeMobileMenu}
                            className="text-foreground/80 hover:text-primary transition-colors text-base"
                          >
                            {item}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link href="/certifications" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">Certifications</Link>
                <Link href="/blog" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">Journal</Link>
                <Link href="/contact" onClick={closeMobileMenu} className="text-foreground/90 font-medium hover:text-primary transition-colors text-lg">Contact</Link>
                
                <div className="flex flex-col space-y-3">
                  <span className="text-foreground/90 font-bold text-lg">Vendors</span>
                  <Link href="/vendors" onClick={closeMobileMenu} className="pl-4 text-emerald-600 dark:text-emerald-400 font-bold transition-colors text-lg">Browse Vendor Marketplace</Link>
                  <Link href="/vendor/login" onClick={closeMobileMenu} className="pl-4 text-foreground/80 hover:text-primary transition-colors text-lg">Vendor Login</Link>
                  <Link href="/vendor/register" onClick={closeMobileMenu} className="pl-4 text-foreground/80 hover:text-primary transition-colors text-lg">Vendor Sign Up</Link>
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
