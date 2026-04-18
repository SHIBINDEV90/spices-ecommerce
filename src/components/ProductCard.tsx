"use client";

import type { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Check, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  index?: number;
  featured?: boolean;
}

export default function ProductCard({ product, index = 0, featured = true }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();
  const [isQuickViewOpen, setQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdded(true);
    addToCart(product);
    setIsCartOpen(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Display calculations matching the screenshot layout
  const rating = 5;
  const reviewCount = (product.name.length * 13) % 200 + 10; // stable random looking number
  const basePrice = product.price || 500;
  const originalPrice = Math.round(basePrice * 1.15);
  const usp = (basePrice / 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
      className="group relative overflow-hidden rounded-[20px] bg-surface border border-neutral-200/60 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 h-full flex flex-col"
    >
      <Link href={`/products/${product._id || product.slug}`} className="relative block h-52 w-full overflow-hidden bg-neutral-100 flex-shrink-0 cursor-pointer">
        <Image
          src={product.imageUrl || '/images/Cardamom.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-foreground text-[10px] font-bold px-3 py-1 rounded-md shadow-sm z-10 border border-black/5">
            Featured
          </div>
        )}

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm z-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-primary text-white hover:bg-orange-600 active:scale-95 active:bg-orange-700 px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 border border-white/20"
          >
            Quick View <ArrowRight size={18} />
          </button>
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${product._id || product.slug}`}>
          <h3 className="font-semibold text-[15px] leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 cursor-pointer mb-2 min-h-[36px]">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill={i < rating ? "currentColor" : "none"} className={i >= rating ? "text-gray-300" : ""} />
            ))}
          </div>
          <span className="text-xs text-foreground/50 ml-1">({reviewCount})</span>
        </div>
        
        {/* Pricing Segment */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-extrabold text-xl text-foreground tracking-tight">
               ₹{basePrice}
            </span>
            <span className="font-medium text-sm text-foreground/40 line-through decoration-1">
               ₹{originalPrice}
            </span>
          </div>
          
          <div className="flex flex-col gap-0.5 mb-4">
            <span className="text-[11px] text-foreground/50">Inclusive of all taxes</span>
            <span className="text-[11px] text-foreground/50">USP: ₹{usp}/g</span>
          </div>
        </div>
        
        {/* Animated Add to Cart Button */}
        <div className="pt-3 border-t border-neutral-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className={`w-full py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden relative text-sm ${
              isAdded 
                ? 'bg-primary text-white shadow-inner' 
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm'
            }`}
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div
                  key="added"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <Check size={18} /> Added
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
      
      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setQuickViewOpen(false)} 
        product={product} 
      />
    </motion.div>
  );
}
