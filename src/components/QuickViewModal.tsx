"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingBag, Check, Truck, ShieldCheck, Leaf, Heart, Share2, Plus, Minus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ReactNode, useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types/product';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const WEIGHT_OPTIONS = [
  { label: '100g', value: 100 },
  { label: '250g', value: 250 },
  { label: '500g', value: 500 },
  { label: '1kg', value: 1000 },
];

export default function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const [selectedWeight, setSelectedWeight] = useState(WEIGHT_OPTIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isBuying, setIsBuying] = useState(false);
  
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();

  // Reset state when a new product is loaded
  useEffect(() => {
    if (isOpen) {
      setSelectedWeight(WEIGHT_OPTIONS[0]);
      setQuantity(1);
      setIsAdded(false);
      setActiveImage(0);
    }
  }, [isOpen, product]);

  if (!product) return null;

  // Use dummy thumbs if product only has 1 image
  const images = [
    product.imageUrl || '/images/Cardamom.jpg',
    product.imageUrl || '/images/Cardamom.jpg',
    product.imageUrl || '/images/Cardamom.jpg',
  ];

  const handleAddToCart = () => {
    addToCart({ ...product, selectedWeight: selectedWeight.label, quantity });
    setIsAdded(true);
    setIsCartOpen(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    setIsBuying(true);
    addToCart({ ...product, selectedWeight: selectedWeight.label, quantity });
    onClose();
    router.push('/checkout');
    setIsBuying(false);
  };

  const rating = 5;
  const reviewCount = (product.name.length * 13) % 200 + 10;
  
  // Base calculations
  const basePrice = product.price || 500;
  // Calculate price based on weight modifier (assuming basePrice is for 100g or 1kg? Let's say basePrice is 100g for now)
  const priceMultiplier = selectedWeight.value / 100;
  const currentPrice = Math.round(basePrice * priceMultiplier);
  const originalPrice = Math.round(currentPrice * 1.15);
  const usp = (basePrice / 100).toFixed(2);

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row pointer-events-auto"
            >
              {/* Close Button Mobile (Absolute Top Right) */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 md:hidden bg-black/50 p-2 rounded-full text-white/50 hover:text-white backdrop-blur-md"
              >
                <X size={20} />
              </button>

              {/* Left Column - Image Gallery */}
              <div className="w-full md:w-1/2 bg-neutral-900/50 p-6 flex flex-col gap-4 relative">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-800 border border-white/5">
                  <Image
                    src={images[activeImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-orange-600/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-sm border border-orange-500">
                    Premium Quality
                  </div>
                </div>
                
                {/* Thumbnails */}
                <div className="flex gap-3 justify-center mt-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                    >
                      <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column - Product Details */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar">
                {/* Desktop Close Button */}
                <div className="hidden md:flex justify-end mb-2">
                  <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-2">
                  <span className="text-primary text-xs font-bold uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">
                    Wayanadan
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {product.name}
                </h2>

                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < rating ? "currentColor" : "none"} className={i >= rating ? "text-neutral-600" : ""} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-white/60">{rating}.0 ({reviewCount} reviews)</span>
                </div>

                {/* Price Section */}
                <div className="mb-6 flex flex-col gap-1 border-b border-white/10 pb-6">
                  <div className="flex items-end gap-3 mb-1">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                      ₹{currentPrice}
                    </span>
                    <span className="text-lg font-medium text-white/40 line-through decoration-1 mb-1">
                      ₹{originalPrice}
                    </span>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2 mb-2">
                      14% OFF
                    </span>
                  </div>
                  <span className="text-xs text-white/40 font-medium">Inclusive of all taxes</span>
                  <span className="text-xs text-white/40 font-medium">USP: ₹{usp}/g</span>
                </div>

                <p className="text-sm text-white/70 leading-relaxed mb-6 font-light">
                  {product.description || "Wayanadcraft Organic Green Cardamom is sourced directly from our own NPOP and PGS-India certified organic farms nestled in the pristine hills of Wayanad. Naturally grown without chemicals, each pod preserves its rich aroma and authentic flavour."}
                </p>

                {/* Select Weight */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Select Weight</h3>
                  <div className="flex flex-wrap gap-2">
                    {WEIGHT_OPTIONS.map((weight) => (
                      <button
                        key={weight.label}
                        onClick={() => setSelectedWeight(weight)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                          selectedWeight.label === weight.label 
                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/30'
                        }`}
                      >
                        {weight.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full sm:w-32">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold text-white w-8 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleAddToCart}
                      className="px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all overflow-hidden relative text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 active:scale-95"
                    >
                      {isAdded ? (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                          <Check size={18} /> Added
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                          <ShoppingBag size={18} /> Add to Cart
                        </motion.div>
                      )}
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      disabled={isBuying}
                      className="px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm bg-white text-black hover:bg-gray-100 active:scale-95 shadow-lg disabled:opacity-70 disabled:cursor-wait">
                      {isBuying ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "Buy Now"
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mb-8 border-b border-white/10 pb-6">
                  <button className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg">
                    <Heart size={14} /> Add to Wishlist
                  </button>
                  <button className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg">
                    <Share2 size={14} /> Share
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 text-center gap-2">
                    <Truck size={20} className="text-emerald-400" />
                    <span className="text-[10px] text-white/60 font-medium leading-tight">Free delivery on orders over ₹500</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 text-center gap-2">
                    <ShieldCheck size={20} className="text-primary" />
                    <span className="text-[10px] text-white/60 font-medium leading-tight">100% Quality guarantee</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 text-center gap-2 cursor-pointer group">
                    <Leaf size={20} className="text-green-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-white/60 font-medium leading-tight group-hover:text-white transition-colors">Certified organic product &rarr;</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
