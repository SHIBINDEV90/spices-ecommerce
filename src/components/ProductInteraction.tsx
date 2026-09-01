'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingCart, PackageOpen, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ProductInteraction({ product }: { product: any }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<'500g' | '1kg'>('1kg');

  // Calculate per gram price
  const basePrice = Number(product.price) || 0;
  const perGramPrice = product.pricePerGram && Number(product.pricePerGram) > 0
    ? Number(product.pricePerGram)
    : (basePrice > 0 ? basePrice / 1000 : 0.5);

  const grams = selectedWeight === '500g' ? 500 : 1000;
  const calculatedPrice = Math.round(perGramPrice * grams);

  const weightOptions = [
    { label: '500g', grams: 500, price: Math.round(perGramPrice * 500) },
    { label: '1kg', grams: 1000, price: Math.round(perGramPrice * 1000) },
  ];

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: calculatedPrice,
      selectedWeight,
      quantity: 1,
    });
    setIsCartOpen(true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-6 mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
      {/* Price Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
            Price for {selectedWeight}
          </p>
          <p className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
            ₹{calculatedPrice}
            <span className="text-xs text-emerald-400 font-normal ml-3">
              (₹{perGramPrice.toFixed(2)} / gram)
            </span>
          </p>
        </div>
        {product.stock > 0 && (
          <div className="text-right">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
              In Stock
            </span>
          </div>
        )}
      </div>

      {/* Weight Selector */}
      <div className="flex flex-col space-y-3">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-widest">
          Select Weight
        </label>
        <div className="grid grid-cols-2 gap-3">
          {weightOptions.map((option) => {
            const isSelected = selectedWeight === option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setSelectedWeight(option.label as '500g' | '1kg')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg font-bold">{option.label}</span>
                <span className="text-sm font-semibold text-emerald-400 mt-1">₹{option.price}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">₹{(option.price / option.grams).toFixed(2)}/g</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Retail Path */}
        <button 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            added 
              ? 'bg-emerald-600 text-white shadow-emerald-500/25' 
              : 'bg-gradient-to-tr from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white shadow-orange-500/20'
          }`}
        >
          {added ? (
            <>Added to Cargo <Check className="w-5 h-5" /></>
          ) : (
            <>Add to Cart ({selectedWeight}) <ShoppingCart className="w-5 h-5" /></>
          )}
        </button>

        {/* Bulk Path */}
        <Link 
          href={`/bulk-enquiry?product=${product._id}`} 
          className="flex-1 block text-center bg-white/5 border border-white/20 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 shadow-lg group"
        >
          Contact Exporter <PackageOpen className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </Link>
      </div>
      
      {product.isBulkAvailable && (
         <div className="pt-2 text-center">
            <p className="text-xs text-amber-500/80 font-medium">✨ High-volume discounts available for bulk export orders.</p>
         </div>
      )}
    </div>
  );
}
