'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Ticket, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CouponForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '0',
    maximumDiscount: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Default 30 days
    usageLimit: '100',
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        maximumDiscount: formData.maximumDiscount ? Number(formData.maximumDiscount) : undefined,
        usageLimit: Number(formData.usageLimit),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create coupon');
      }

      router.push('/admin/coupons');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all";
  const labelClasses = "block text-sm font-medium text-gray-400 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
            Create Coupon
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Add a new discount code
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/coupons"
            className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2 border border-transparent hover:border-white/10"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Coupon
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div>
              <label className={labelClasses}>Coupon Code *</label>
              <input 
                type="text" 
                required 
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="e.g. WELCOME10"
                className={`${inputClasses} uppercase placeholder:normal-case`}
              />
            </div>

            <div>
              <label className={labelClasses}>Description *</label>
              <input 
                type="text" 
                required 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="e.g. 10% off for new customers"
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Discount Type *</label>
                <select 
                  value={formData.discountType}
                  onChange={e => setFormData({...formData, discountType: e.target.value})}
                  className={inputClasses}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Discount Value *</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={e => setFormData({...formData, discountValue: e.target.value})}
                  placeholder="e.g. 10"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Maximum Discount (₹)</label>
              <input 
                type="number" 
                min="0"
                value={formData.maximumDiscount}
                onChange={e => setFormData({...formData, maximumDiscount: e.target.value})}
                placeholder="Leave blank for no limit"
                className={inputClasses}
                disabled={formData.discountType === 'fixed'}
              />
              <p className="text-xs text-gray-500 mt-2">Only applicable for percentage discounts.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelClasses}>Minimum Order Amount (₹)</label>
              <input 
                type="number" 
                min="0"
                value={formData.minimumOrderAmount}
                onChange={e => setFormData({...formData, minimumOrderAmount: e.target.value})}
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Start Date *</label>
                <input 
                  type="date" 
                  required 
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>End Date *</label>
                <input 
                  type="date" 
                  required 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Usage Limit *</label>
              <input 
                type="number" 
                required 
                min="1"
                value={formData.usageLimit}
                onChange={e => setFormData({...formData, usageLimit: e.target.value})}
                className={inputClasses}
              />
              <p className="text-xs text-gray-500 mt-2">Total number of times this coupon can be used across all customers.</p>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-orange-500' : 'bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : ''}`}></div>
                </div>
                <div>
                  <span className="text-white font-medium block">Coupon Status</span>
                  <span className="text-sm text-gray-400 block">{formData.isActive ? 'Active and ready to use' : 'Disabled'}</span>
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
