'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tractor, Store } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  isBulkAvailable?: boolean;
  vendor?: {
    vendorType?: string;
    businessName?: string;
  } | null;
}

export default function ProductImageGallery({
  images,
  productName,
  isBulkAvailable = false,
  vendor = null,
}: ProductImageGalleryProps) {
  // Ensure we have at least one image source
  const validImages = images && images.length > 0 ? images : ['/images/Cardamom.jpg'];
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Guard against out-of-bounds index
  const activeImage = validImages[selectedIndex] || validImages[0];
  const isUploadedImage = typeof activeImage === 'string' && activeImage.startsWith('/uploads/');

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image Container */}
      <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group bg-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={activeImage}
              alt={`Photo of ${productName} - view ${selectedIndex + 1}`}
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-105"
              unoptimized={isUploadedImage}
            />
          </motion.div>
        </AnimatePresence>

        {/* Wholesale Badge */}
        {isBulkAvailable && (
          <div className="absolute top-6 left-6 z-10 bg-amber-500 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
            Wholesale Valid
          </div>
        )}

        {/* Vendor Direct Badge */}
        {vendor && (
          <div className="absolute top-6 right-6 z-10 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
            {vendor.vendorType === 'Farmer' ? <Tractor size={14} /> : <Store size={14} />}
            {vendor.vendorType || 'Vendor'} Direct
          </div>
        )}

        {/* Next / Prev Chevrons for Multi-image */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/20 shadow-lg cursor-pointer z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/20 shadow-lg cursor-pointer z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Photo Counter Pill */}
            <div className="absolute bottom-4 right-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-mono rounded-full border border-white/10">
              {selectedIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Row (if more than 1 image) */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
          {validImages.map((imgUrl, idx) => {
            const isSelected = idx === selectedIndex;
            const isUploaded = typeof imgUrl === 'string' && imgUrl.startsWith('/uploads/');

            return (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-white/5 ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/40 scale-105 shadow-lg shadow-orange-500/20'
                    : 'border-white/10 hover:border-white/40 opacity-70 hover:opacity-100'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={isUploaded}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
