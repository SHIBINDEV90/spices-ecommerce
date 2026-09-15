'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Zap, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ShoppingBag, 
  ChevronRight, 
  Filter, 
  Sparkles, 
  Store,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickCommercePage() {
  const { location, setIsModalOpen, setQuickMode } = useLocation();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Set quick mode active when visiting this page
  useEffect(() => {
    setQuickMode(true);
  }, [setQuickMode]);

  // Fetch quick products based on customer location
  useEffect(() => {
    const fetchQuickProducts = async () => {
      setLoading(true);
      setError(null);

      const lat = location.lat || 11.5561;
      const lng = location.lng || 76.0389;

      try {
        const res = await fetch(`/api/quick/products?lat=${lat}&lng=${lng}&radius=35`);
        const data = await res.json();

        if (res.ok && data.success) {
          setProducts(data.products || []);
        } else {
          setError(data.message || 'Failed to fetch quick commerce products.');
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError('Network error loading nearby products.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuickProducts();
  }, [location.lat, location.lng]);

  const handleAddToCart = (product: any) => {
    addToCart({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl || (product.images && product.images[0]) || '/images/hero-spice.jpg',
      description: product.description,
      productType: product.productType || 'Spice',
      stock: product.stock,
      isRetailAvailable: true,
      isBulkAvailable: false,
      selectedWeight: '500g',
    } as any);

    setAddedItemNotice(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  const categories = ['All', 'Cardamom', 'Pepper', 'Cinnamon', 'Nutmeg', 'Cloves'];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => 
        (p.name && p.name.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
      );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-neutral-100 pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-amber-600 via-emerald-700 to-primary text-white py-12 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider text-amber-200">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Wayanad Hyperlocal Quick Commerce</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Fresh Wayanad Spices in <span className="text-amber-300">30–60 Minutes</span>
              </h1>
              
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Directly dispatched from our central hub in <strong className="text-white underline decoration-amber-400">Vythiri, Wayanad (PIN: 673576)</strong> within a 35 km delivery radius (Kalpetta, Meppadi, Lakkidi, Sultan Bathery, Mananthavady).
              </p>
            </div>

            {/* Current Location Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 min-w-[280px]">
              <div className="text-xs uppercase tracking-wider text-white/70 font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>Delivering To</span>
              </div>
              
              <div className="font-bold text-lg text-white truncate">
                {location.city || 'Vythiri, Wayanad'}
              </div>
              
              <p className="text-xs text-white/70 truncate">
                {location.address || 'Wayanad, Kerala - 673576, India'}
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Change Delivery Location</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>


          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/20 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10">
                <Clock className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="font-bold text-white">30–60 Mins</div>
                <div className="text-white/70 text-[11px]">Average ETA</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10">
                <MapPin className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="font-bold text-white">35 km Radius</div>
                <div className="text-white/70 text-[11px]">Strict Proximity</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10">
                <Store className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="font-bold text-white">Verified Vendors</div>
                <div className="text-white/70 text-[11px]">Locally Fulfilled</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="font-bold text-white">100% Pure</div>
                <div className="text-white/70 text-[11px]">Malabar Heritage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notice when item added */}
      <AnimatePresence>
        {addedItemNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{addedItemNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Pills & Controls */}
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 mt-8">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-neutral-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Showing {filteredProducts.length} Quick Delivery Spices</span>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-sm font-medium text-neutral-500">Scanning local stores within 35 km...</span>
          </div>
        ) : error ? (
          <div className="my-12 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h3 className="font-bold text-neutral-900 dark:text-white">Service Notice</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{error}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs"
            >
              Select Another Location
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="my-16 text-center max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
            <Store className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No Quick Products in this Category</h3>
            <p className="text-xs text-neutral-500 mt-2">
              Try switching categories or choosing an alternative delivery point.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory('All')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold"
              >
                View All Quick Spices
              </button>
              <Link
                href="/products"
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold"
              >
                Browse Pan-India Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredProducts.map((product) => {
              const qc = product.quickCommerce || {};
              const displayImage = product.imageUrl || (product.images && product.images[0]) || '/images/hero-spice.jpg';

              return (
                <div
                  key={product._id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-square w-full bg-neutral-100 dark:bg-zinc-800 overflow-hidden">
                    <Image
                      src={displayImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* ETA Badge */}
                    <div className="absolute top-3 left-3 bg-amber-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>{qc.etaFormatted || '30–45 mins'}</span>
                    </div>

                    {/* Distance Badge */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white font-semibold text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-amber-300" />
                      <span>{qc.distanceKm ? `${qc.distanceKm} km` : '< 5 km'}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Vendor Store Tag */}
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                        <Store className="w-3 h-3 text-emerald-500" />
                        <span className="truncate">{qc.vendorName || 'SpiceWizz Certified Store'}</span>
                      </div>

                      <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                        <h3 className="font-bold text-neutral-900 dark:text-white text-base line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-neutral-400 block">Price</span>
                        <span className="text-lg font-black text-neutral-900 dark:text-white">
                          ₹{product.price}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add Quick</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
