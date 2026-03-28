"use client";

import type { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdded(true);
    addToCart(product);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
      className="group relative overflow-hidden rounded-2xl bg-surface border border-neutral-100 shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
    >
      <Link href={`/products/${product._id}`} className="relative block h-64 w-full overflow-hidden bg-neutral-100 flex-shrink-0 cursor-pointer">
        <Image
          src={product.imageUrl || '/images/Cardamom.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Sale Badge Example */}
        <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 transform -rotate-2">
          HOT SELLER
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <span className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 text-primary px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
            View Item <ArrowRight size={18} />
          </span>
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product._id}`}>
            <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1 cursor-pointer">
              {product.name}
            </h3>
          </Link>
          {/* Mock Price */}
          <span className="font-extrabold text-lg text-secondary min-w-max ml-2">
            $24.99
          </span>
        </div>
        
        <p className="text-foreground/70 text-sm line-clamp-2 mb-6 flex-grow">
          {product.description}
        </p>
        
        {/* Animated Add to Cart Button */}
        <div className="pt-4 border-t border-neutral-100 mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden relative ${
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
                  <Check size={20} /> Added to Cart
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
                  <ShoppingBag size={20} /> Add to Cart
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
