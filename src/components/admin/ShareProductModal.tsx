'use client';

import React, { useState } from 'react';
import { Share2, X, MessageSquare, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

type Product = {
  _id: string;
  name: string;
  category?: string;
  price: number;
  stock: number;
  approvalStatus: string;
  weight?: string;
};

interface ShareProductModalProps {
  product?: Product | null;
  isCatalog?: boolean;
  totalProductsCount?: number;
  onClose: () => void;
}

export default function ShareProductModal({ 
  product, 
  isCatalog = false, 
  totalProductsCount = 0, 
  onClose 
}: ShareProductModalProps) {
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://spicewizz.com';
  
  // Determine URL and message text based on mode (single product vs whole catalog)
  const productUrl = isCatalog 
    ? `${origin}/products`
    : `${origin}/products/${product?._id}`;
    
  const messageText = isCatalog
    ? `Hello! 👋

We would like to share our complete range of premium spices with you:

🌿 SpiceWizz Spices Catalog

View all products:
${productUrl}

Thank you!`
    : `Hello! 👋

We would like to share this product with you:

🌿 ${product?.name}

💰 Price: ₹${product?.price.toLocaleString('en-IN')}${product?.weight ? ` / ${product?.weight}` : ''}

View product:
${productUrl}

Thank you!`;

  const handleShare = () => {
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
      cleanedPhone = '91' + cleanedPhone;
    }
    
    const url = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 flex flex-col text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center space-x-2 text-orange-400">
            <Share2 className="w-5 h-5" />
            <h3 className="font-bold text-lg text-white">
              {isCatalog ? 'Share Entire Catalog' : 'Share Product'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Details preview card */}
          {isCatalog ? (
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Catalog details</span>
              <span className="font-bold text-white text-base">SpiceWizz Spices Catalog</span>
              <span className="text-sm font-semibold text-orange-400">
                {totalProductsCount > 0 ? `${totalProductsCount} Products` : 'Entire Collection'}
              </span>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product details</span>
              <span className="font-bold text-white text-base">{product?.name}</span>
              <span className="text-sm font-semibold text-orange-400">
                ₹{product?.price.toLocaleString('en-IN')}{product?.weight ? ` / ${product?.weight}` : ''}
              </span>
            </div>
          )}

          {/* Phone input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="customer-phone" className="text-sm font-semibold text-gray-300">
              Customer Mobile Number
            </label>
            <div className="relative rounded-lg shadow-sm">
              <input
                id="customer-phone"
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="e.g. 9876543210 or +919876543210"
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-white transition-all placeholder:text-gray-600"
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Tip: Enter customer's 10-digit number. We'll auto-prefix +91 (India) if no country code is provided.
            </p>
          </div>

          {/* Live message preview styled like a WhatsApp chat bubble in dark mode */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              WhatsApp Message Preview
            </span>
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl rounded-tr-none p-4 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed relative">
              {/* Message tail */}
              <div className="absolute top-0 right-0 transform translate-x-1/2 w-0 h-0 border-t-[8px] border-t-emerald-950/20 border-r-[8px] border-r-transparent border-l-[8px] border-l-transparent" style={{ borderColor: 'transparent transparent transparent rgb(6 78 59 / 0.2)' }} />
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!phone.trim()}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                phone.trim() 
                  ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
