'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  ChevronDown, 
  MapPin, 
  AlertCircle, 
  Lock, 
  Check, 
  Scale 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { NAVBAR_PRODUCTS } from '@/components/Navbar';

const COUNTRIES = [
  'India',
  'United States',
  'United Arab Emirates',
  'United Kingdom',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Kuwait',
  'Bahrain',
  'Singapore',
  'Malaysia',
  'Australia',
  'Canada',
  'Germany',
  'France',
  'Netherlands',
  'Japan',
  'South Korea',
  'South Africa',
  'Spain',
  'Italy',
  'Vietnam',
  'Thailand',
  'Indonesia',
  'Egypt',
  'Sri Lanka',
  'New Zealand',
  'Brazil',
  'Mexico',
  'Other'
];

export default function BulkEnquiryForm({ products }: { products: any[] }) {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('product') || '';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Cargo volume state
  const [volumeKg, setVolumeKg] = useState<string>('');
  const [volumeError, setVolumeError] = useState<string>('');

  // Destination country dropdown state (India only, other countries blurred)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    product: preselectedProductId || (NAVBAR_PRODUCTS.length > 0 ? NAVBAR_PRODUCTS[0] : ''),
    name: '',
    email: '',
    company: '',
    country: 'India',
    quantity: '',
    grade: '',
    packaging: '',
    message: ''
  });

  // Close country dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setVolumeKg(val);

    const num = parseFloat(val);
    if (!val) {
      setVolumeError('');
      setFormData(prev => ({ ...prev, quantity: '' }));
    } else if (isNaN(num)) {
      setVolumeError('Please enter a valid numeric volume in KG.');
      setFormData(prev => ({ ...prev, quantity: '' }));
    } else if (num > 500) {
      setVolumeError('Estimated Cargo Volume cannot exceed 500 KG. Maximum permissible quantity is 500 KG.');
      setFormData(prev => ({ ...prev, quantity: `${val} KG` }));
    } else if (num <= 0) {
      setVolumeError('Volume must be greater than 0 KG.');
      setFormData(prev => ({ ...prev, quantity: `${val} KG` }));
    } else {
      setVolumeError('');
      setFormData(prev => ({ ...prev, quantity: `${num} KG` }));
    }
  };

  const handlePresetSelect = (kg: number) => {
    setVolumeKg(kg.toString());
    setVolumeError('');
    setFormData(prev => ({ ...prev, quantity: `${kg} KG` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const parsedKg = parseFloat(volumeKg);
    if (!volumeKg || isNaN(parsedKg) || parsedKg <= 0) {
      setError('Please specify a valid Estimated Cargo Volume (1 to 500 KG).');
      setLoading(false);
      return;
    }

    if (parsedKg > 500) {
      setError('Estimated Cargo Volume cannot exceed 500 KG. We currently accept orders up to 500 KG only.');
      setVolumeError('Estimated Cargo Volume cannot exceed 500 KG.');
      setLoading(false);
      return;
    }

    if (formData.country !== 'India') {
      setError('We currently supply orders within India only. International delivery is temporarily unavailable.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        country: 'India',
        quantity: `${parsedKg} KG`
      };

      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-3xl backdrop-blur-md max-w-2xl mx-auto shadow-2xl"
      >
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6 animate-bounce" />
        <h2 className="text-3xl font-bold text-white mb-4">Enquiry Received Successfully</h2>
        <p className="text-gray-300 text-base max-w-md mx-auto leading-relaxed">
          Our procurement trade desk has received your request for delivery within <strong>India</strong>. We will review your cargo volume requirements (up to 500 KG) and respond with pricing and dispatch details within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-lg shadow-2xl relative z-10 w-full max-w-4xl mx-auto space-y-6">
      
      {/* India Supply Notice Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-white text-sm block">Domestic India Supply Only (Max 500 KG)</strong>
            <span className="text-gray-300">
              Bulk orders are currently accepted exclusively for delivery across India. International export destinations are temporarily paused.
            </span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider text-[10px] shrink-0">
          🇮🇳 India Active
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Commodity of Interest */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Commodity of Interest *</label>
            <div className="relative">
              <select
                required
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none font-semibold cursor-pointer"
              >
                <option value="" disabled>Select a Commodity</option>
                {NAVBAR_PRODUCTS.map(item => (
                  <option key={item} value={item} className="bg-gray-800 text-white">
                    {item}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Estimated Cargo Volume (Max 500 KG constraint) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-orange-400" />
                <span>Estimated Cargo Volume *</span>
              </label>
              <span className="text-[11px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Max 500 KG Limit
              </span>
            </div>

            <div className="relative">
              <input
                required
                type="number"
                min="1"
                max="500"
                step="any"
                name="quantity"
                value={volumeKg}
                onChange={handleVolumeChange}
                placeholder="Enter volume in KG (1 - 500)"
                className={`w-full bg-black/40 border rounded-xl px-4 py-4 pr-16 text-white focus:outline-none focus:ring-2 font-mono text-base ${
                  volumeError 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-white/10 focus:ring-orange-500/50'
                }`}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="text-xs font-bold text-gray-400 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                  KG
                </span>
              </div>
            </div>

            {/* Quick volume presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400 font-medium mr-1">Quick Select:</span>
              {[25, 50, 100, 250, 500].map((kg) => (
                <button
                  key={kg}
                  type="button"
                  onClick={() => handlePresetSelect(kg)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    parseFloat(volumeKg) === kg
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 font-bold shadow-md shadow-orange-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
                  }`}
                >
                  {kg} KG{kg === 500 ? ' (Max)' : ''}
                </button>
              ))}
            </div>

            {volumeError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 font-medium pt-0.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{volumeError}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Contact Name *</label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Full Name"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Corporate / Contact Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address *</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="purchasing@company.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company / Organization */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Company / Organization</label>
            <input
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Your Business Name (Optional)"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Destination Country (India Only, Other Countries Blurred) */}
          <div className="space-y-2" ref={countryDropdownRef}>
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-gray-300">Destination Country *</label>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>India Supply Only</span>
              </span>
            </div>

            <div className="relative">
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="w-full bg-black/40 border border-white/10 hover:border-orange-500/40 rounded-xl px-4 py-4 text-left text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🇮🇳</span>
                  <span className="font-semibold text-white">India</span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    Domestic Supply Active
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Custom Dropdown Menu with Blurred International Countries */}
              <AnimatePresence>
                {isCountryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#121214] border border-white/15 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                  >
                    {/* Header Info Banner */}
                    <div className="p-3 bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-b border-white/10 flex items-start gap-2.5 text-xs text-amber-300">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-bold">Supplying Exclusively in India</strong>
                        <span>International destinations are temporarily paused and blurred out below.</span>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-white/5 p-1.5 space-y-1">
                      {/* Active Selectable India Option */}
                      <div
                        onClick={() => {
                          setFormData(prev => ({ ...prev, country: 'India' }));
                          setIsCountryDropdownOpen(false);
                        }}
                        className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between cursor-pointer hover:bg-emerald-500/25 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇮🇳</span>
                          <div>
                            <span className="font-bold text-white group-hover:text-emerald-300 text-sm block">India</span>
                            <span className="text-[11px] text-gray-300">Domestic Wholesale &amp; Bulk Logistics (All States)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active / Select</span>
                        </div>
                      </div>

                      {/* Header for Blurred International Countries */}
                      <div className="px-3 pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>International Destinations (Currently Disabled)</span>
                      </div>

                      {/* Blurred Non-India Countries (Not deleted, only blurred) */}
                      <div className="space-y-1 relative">
                        {COUNTRIES.filter(c => c !== 'India').map(c => (
                          <div
                            key={c}
                            className="p-2.5 rounded-lg flex items-center justify-between select-none cursor-not-allowed opacity-35 filter blur-[1.5px] transition-all"
                            title="Currently supplying only within India"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-gray-400 text-xs">🌐</span>
                              <span className="text-sm text-gray-300 font-medium">{c}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>India Only</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden native input for form compatibility */}
              <input type="hidden" name="country" value="India" />
            </div>
          </div>
        </div>

        {/* Detailed Requirements */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Detailed Requirements *</label>
          <textarea
            required
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder="Please specify spice grade, preferred packaging (e.g. 25kg jute sacks, vacuum-sealed bags), delivery pincode, and target date..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y"
          />
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            ⚡ Domestic cargo orders processed within 24 hours. Maximum order volume: 500 KG.
          </p>
          <button
            type="submit"
            disabled={loading || Boolean(volumeError) || !volumeKg || parseFloat(volumeKg) > 500}
            className="w-full sm:w-auto h-14 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-base hover:from-orange-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-lg shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Bulk Enquiry <Send className="w-4 h-4" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
