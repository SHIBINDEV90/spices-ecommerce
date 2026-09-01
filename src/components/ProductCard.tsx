"use client";

import type { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Check, Star, Store, Tractor, ShieldCheck } from 'lucide-react';
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

  const basePrice = Number(product.price) || 500;
  const perGramPrice = product.pricePerGram && Number(product.pricePerGram) > 0
    ? Number(product.pricePerGram)
    : (basePrice > 0 ? basePrice / 1000 : 0.5);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdded(true);
    addToCart({ ...product, price: Math.round(perGramPrice * 1000), selectedWeight: '1kg' });
    setIsCartOpen(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Display calculations matching the screenshot layout
  const rating = 5;
  const reviewCount = (product.name.length * 13) % 200 + 10; // stable random looking number
  const originalPrice = Math.round(basePrice * 1.15);
  const usp = perGramPrice.toFixed(2);
  const productImage = product.imageUrl || '/images/Cardamom.jpg';
  const isUploadedImage = productImage.startsWith('/uploads/');

  const vendor = typeof product.vendorId === 'object' && product.vendorId !== null ? product.vendorId : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
      className="group relative overflow-hidden rounded-[20px] bg-surface border border-neutral-200/60 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 h-full flex flex-col"
    >
      <Link href={`/products/${product._id || product.slug}`} className="relative block h-40 w-full overflow-hidden bg-neutral-100 flex-shrink-0 cursor-pointer">
        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          unoptimized={isUploadedImage}
        />
        
        {/* Source / Featured Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {vendor ? (
            <span className="bg-emerald-700/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm flex items-center gap-1">
              {vendor.vendorType === 'Farmer' ? <Tractor size={11} /> : <Store size={11} />}
              {vendor.vendorType || 'Vendor'} Product
            </span>
          ) : (
            <span className="bg-primary/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm flex items-center gap-1">
              <ShieldCheck size={11} /> Direct Store
            </span>
          )}

          {featured && (
            <span className="bg-white/90 backdrop-blur text-foreground text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm border border-black/5 ml-auto">
              Featured
            </span>
          )}
        </div>

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
      
      <div className="p-3 flex flex-col flex-grow">
        {/* Vendor/Store Label */}
        {vendor ? (
          <Link href={`/vendors/${vendor._id}`} className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline mb-1">
            {vendor.vendorType === 'Farmer' ? <Tractor size={12} /> : <Store size={12} />}
            <span className="truncate">Sold by {vendor.businessName}</span>
          </Link>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] text-foreground/50 font-medium mb-1">
            <ShieldCheck size={12} className="text-primary" />
            <span>Spicewizz Official</span>
          </div>
        )}

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
        <div className="pt-2 border-t border-neutral-100 mt-2">
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
