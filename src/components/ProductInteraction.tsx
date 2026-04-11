'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingCart, PackageOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ProductInteraction({ product }: { product: any }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [added, setAdded] = useState(false);

  // Since we modified context to expect a product directly instead of just _id
  // The original context addToCart takes only one argument `product`! The context manages quantity natively internally (always +1 or array map logic).
  const handleAddToCart = () => {
    addToCart(product);
    setIsCartOpen(true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-6 mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
      <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-2">
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-1">Standard Market Price</p>
          <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
            ${product.price.toFixed(2)}
            <span className="text-sm text-gray-500 font-normal ml-2">/ kg</span>
          </p>
        </div>
        <div className="text-right">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            product.stock > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'
          }`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <>Added to Cargo <ShoppingCart className="w-5 h-5 fill-white" /></>
          ) : (
            <>Add to Cart <ShoppingCart className="w-5 h-5" /></>
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
         <div className="pt-4 text-center">
            <p className="text-sm text-amber-500/80 font-medium">✨ This spice scales up! High-volume discounts available for industrial fulfillment.</p>
         </div>
      )}
    </div>
  );
}
