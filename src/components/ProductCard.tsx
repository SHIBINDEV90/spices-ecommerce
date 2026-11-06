"use client";

import type { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Check, Star, Store, Tractor, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import QuickViewModal from './QuickViewModal';
import { isSaffronProduct } from './Navbar';

interface ProductCardProps {
  product: Product;
  index?: number;
  featured?: boolean;
}

export default function ProductCard({ product, index = 0, featured = true }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();
  const [isQuickViewOpen, setQuickViewOpen] = useState(false);

  const isSaffron = isSaffronProduct(product);
  const basePrice = Number(product.price) || 500;
  const perGramPrice = basePrice > 0
    ? basePrice / 1000
    : (product.pricePerGram && Number(product.pricePerGram) > 0 ? Number(product.pricePerGram) : 0.5);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSaffron) {
      // Open Quick View so customer can select 1g to 1kg weight
      setQuickViewOpen(true);
      return;
    }
    setIsAdded(true);
    addToCart({ ...product, price: basePrice, selectedWeight: '1kg' });
    setIsCartOpen(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Dynamic product rating and reviews count
  const ratingValue = product.rating !== undefined && !isNaN(Number(product.rating)) ? Number(product.rating) : 5;
  const reviewCount = product.reviewsCount !== undefined ? Number(product.reviewsCount) : 0;
  const originalPrice = (product.originalPrice && Number(product.originalPrice) > basePrice) ? Number(product.originalPrice) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - basePrice) / originalPrice) * 100) : 0;
  // 1g price
  const usp = perGramPrice.toFixed(2);
  const [imgSrc, setImgSrc] = useState(product.imageUrl || '/images/Cardamom.jpg');
  const isUploadedImage = typeof imgSrc === 'string' && imgSrc.startsWith('/uploads/');

  const vendor = typeof product.vendorId === 'object' && product.vendorId !== null ? product.vendorId : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08, type: "spring", stiffness: 100 }}
      className="group relative overflow-hidden rounded-2xl bg-surface border border-neutral-200/60 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 h-full flex flex-col"
    >
      <Link href={`/products/${product._id || product.slug}`} className="relative block h-36 w-full overflow-hidden bg-neutral-100 flex-shrink-0 cursor-pointer">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          unoptimized={isUploadedImage}
          onError={() => setImgSrc('/images/Cardamom.jpg')}
        />
        
        {/* Source / Featured Badge */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {vendor ? (
            <span className="bg-emerald-700/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md backdrop-blur-sm flex items-center gap-1">
              {vendor.vendorType === 'Farmer' ? <Tractor size={10} /> : <Store size={10} />}
              {vendor.vendorType || 'Vendor'} Product
            </span>
          ) : (
            <span className="bg-primary/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md backdrop-blur-sm flex items-center gap-1">
              <ShieldCheck size={10} /> Direct Store
            </span>
          )}

          {featured && (
            <span className="bg-white/90 backdrop-blur text-foreground text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-black/5 ml-auto">
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
            className="translate-y-3 group-hover:translate-y-0 transition-all duration-300 bg-primary text-white hover:bg-orange-600 active:scale-95 active:bg-orange-700 px-5 py-2.5 text-xs rounded-full font-bold shadow-2xl flex items-center gap-1.5 border border-white/20"
          >
            Quick View <ArrowRight size={15} />
          </button>
        </div>
      </Link>
      
      <div className="p-3 flex flex-col flex-grow">
        {/* Vendor/Store Label + Rating Row */}
        <div className="flex items-center justify-between gap-1 mb-1">
          {vendor ? (
            <Link href={`/vendors/${vendor._id}`} className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline truncate">
              {vendor.vendorType === 'Farmer' ? <Tractor size={11} /> : <Store size={11} />}
              <span className="truncate">Sold by {vendor.businessName}</span>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-1 text-[11px] text-foreground/50 font-medium truncate">
              <ShieldCheck size={11} className="text-primary shrink-0" />
              <span className="truncate">Spicewizz Official</span>
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0">
            <Star size={12} fill="currentColor" className="text-amber-500" />
            <span className="text-xs font-semibold text-foreground/80">
              {ratingValue.toFixed(1)}
            </span>
            {reviewCount > 0 && (
              <span className="text-[11px] text-foreground/50">({reviewCount})</span>
            )}
          </div>
        </div>

        <Link href={`/products/${product._id || product.slug}`}>
          <h3 className="font-semibold text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1 cursor-pointer mb-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Pricing Segment */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-extrabold text-xl text-foreground tracking-tight">
               ₹{basePrice}
            </span>
            {originalPrice && (
              <span className="font-medium text-sm text-foreground/40 line-through decoration-1">
                 ₹{originalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="flex flex-col gap-0.5 mb-2">
            <span className="text-[11px] text-foreground/50">Inclusive of all taxes</span>
            <span className="text-[11px] text-foreground/50">USP: ₹{usp}/g</span>
            <span className="text-[11px] font-semibold text-emerald-600">
              {isSaffron
                ? 'Weights: 1g, 2g, 5g,'
                : basePrice >= 2000
                  ? 'Weights: 250g, 500g, 1kg'
                  : 'Weights: 500g, 1kg'}
            </span>
          </div>
        </div>
        
        {/* Animated Add to Cart Button */}
        <div className="pt-2 border-t border-neutral-100 mt-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className={`w-full py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden relative text-xs ${
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
                  className="flex items-center gap-1.5"
                >
                  <Check size={16} /> Added to Cart
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingBag size={16} /> {isSaffron ? 'View & Select Weight' : 'Add to Cart'}
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
