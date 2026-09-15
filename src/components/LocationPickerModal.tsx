'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Search, 
  X, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { POPULAR_HUBS, HubPreset } from '@/lib/geo';

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
  };
}

export default function LocationPickerModal() {
  const { 
    location, 
    isModalOpen, 
    setIsModalOpen, 
    detectCurrentLocation, 
    setLocation,
    isDetecting,
    error: geoError,
    isQuickMode,
    setQuickMode
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedHub, setSelectedHub] = useState<HubPreset | null>(null);

  // Debounced search for locations via OpenStreetMap
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const queryWithContext = searchQuery.toLowerCase().includes('kerala') 
          ? searchQuery 
          : `${searchQuery}, Kerala, India`;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(queryWithContext)}&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'SpiceWizz-Ecommerce/1.0',
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUseGPS = async () => {
    const success = await detectCurrentLocation();
    if (success) {
      setTimeout(() => {
        setIsModalOpen(false);
      }, 500);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const cityName = 
      result.address?.suburb || 
      result.address?.city || 
      result.address?.town || 
      result.display_name.split(',')[0];

    setLocation(lat, lng, result.display_name, cityName);
    setSearchQuery('');
    setSearchResults([]);
    setIsModalOpen(false);
  };

  const handleSelectHub = (hub: HubPreset) => {
    setSelectedHub(hub);
    setLocation(hub.lat, hub.lng, `${hub.name}, ${hub.district}, Kerala`, hub.name);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 300);
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary text-white shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Choose Delivery Location</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Within 35 km of Spicewizz Wayanad Hub (PIN: 673576)</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-zinc-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-5">
            {/* Quick GPS Button */}
            <button
              onClick={handleUseGPS}
              disabled={isDetecting}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-sm">
                  {isDetecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <span className="block text-sm font-semibold">Use Current GPS Location</span>
                  <span className="block text-xs opacity-75">Instant auto-detection via device</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </button>

            {geoError && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{geoError}</span>
              </div>
            )}

            {/* Address Search Input */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Or Search Address / Pincode
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Vythiri, Kalpetta, Meppadi, 673576, 673121..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-800/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Search Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div className="mt-2 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg divide-y divide-neutral-100 dark:divide-zinc-800 overflow-hidden">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full text-left p-3 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 flex items-start gap-2.5 transition"
                    >
                      <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-snug line-clamp-2">
                        {result.display_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Wayanad 35 km Delivery Towns */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Wayanad 35 km Delivery Towns (1-Click Selection)
              </label>

              <div className="flex flex-wrap gap-2">
                {POPULAR_HUBS.map((hub) => {
                  const isCurrent = location.city.includes(hub.name) || selectedHub?.name === hub.name;
                  return (
                    <button
                      key={hub.name}
                      onClick={() => handleSelectHub(hub)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                        isCurrent
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-800/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <MapPin className="w-3 h-3 opacity-70" />
                      {hub.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 35km Quick Commerce Preference Card */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    ⚡ 35 km Quick Commerce
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Filter catalog to items delivered in 30–60 mins
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickMode(!isQuickMode)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isQuickMode ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-zinc-700'
                }`}
                role="switch"
                aria-checked={isQuickMode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isQuickMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer - Currently Selected Info */}
          <div className="p-4 border-t border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
                Delivering to: <strong className="text-neutral-900 dark:text-white">{location.city || 'Vythiri, Wayanad'}</strong>
              </span>

            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition flex-shrink-0"
            >
              Confirm Location
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
