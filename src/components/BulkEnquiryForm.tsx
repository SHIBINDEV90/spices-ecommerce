'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BulkEnquiryForm({ products }: { products: any[] }) {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('product') || '';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    product: preselectedProductId || (products.length > 0 ? products[0]._id : ''),
    name: '',
    email: '',
    company: '',
    country: '',
    quantity: '',
    grade: '',
    packaging: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
        className="text-center bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-3xl backdrop-blur-md"
      >
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Request Received</h2>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Our international trade team has been notified. We will review your cargo requirements and respond via email within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-lg shadow-2xl relative z-10 w-full max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-medium tracking-wide">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Commodity of Interest *</label>
            <select
              required
              name="product"
              value={formData.product}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none font-semibold"
            >
              <option value="" disabled>Select a Commodity</option>
              {products.map(p => (
                <option key={p._id} value={p._id} className="bg-gray-800 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Estimated Cargo Volume *</label>
            <input
              required
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 500 KG or 2 Metric Tons"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Corporate Email *</label>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Company / Organization</label>
            <input
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Destination Country *</label>
            <input
              required
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="United States, Japan, etc."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Detailed Requirements *</label>
          <textarea
            required
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            placeholder="Please specify specific moisture content, certifications needed, and delivery timelines..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y"
          />
        </div>

        <div className="pt-6 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto h-16 px-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-lg hover:from-orange-400 hover:to-amber-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-orange-500/20 active:scale-[0.98] mx-auto"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Submitting RFQ <Send className="w-5 h-5" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
