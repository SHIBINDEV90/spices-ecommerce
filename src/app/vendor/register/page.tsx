'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    gstNumber: '',
    iecNumber: '',
    vendorType: 'Farmer',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        businessAddress: {
          ...prev.businessAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate password policy: min 5 chars, 1 uppercase, 1 digit, no special chars
    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters long.');
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter.');
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one digit.');
      setLoading(false);
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(formData.password)) {
      setError('Password must not contain any special characters (only letters and numbers are allowed).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/vendor/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Application Submitted!</h2>
          <p className="text-neutral-600">
            Thank you for applying to become a vendor. Your application is currently pending review by our admin team.
            You will be notified once it is approved.
          </p>
          <p className="mt-4 text-sm text-neutral-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primary-900">Become a Vendor</h1>
            <p className="mt-2 text-neutral-600">Join our marketplace and start selling globally.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Details */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Business Name *</label>
                  <input required type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Vendor Type *</label>
                  <select required name="vendorType" value={formData.vendorType} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none">
                    <option value="Farmer">Farmer / Producer</option>
                    <option value="Exporter">Exporter / Processor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">GST Number</label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">IEC Number</label>
                  <input type="text" name="iecNumber" value={formData.iecNumber} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Owner Name *</label>
                  <input required type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number *</label>
                  <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Password *</label>
                  <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Password must be at least 5 characters, contain at least one uppercase letter and one digit, with no special characters.
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">Business Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Street Address *</label>
                  <input required type="text" name="address.street" value={formData.businessAddress.street} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">City *</label>
                  <input required type="text" name="address.city" value={formData.businessAddress.city} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">State/Province *</label>
                  <input required type="text" name="address.state" value={formData.businessAddress.state} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Country *</label>
                  <input required type="text" name="address.country" value={formData.businessAddress.country} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Postal Code *</label>
                  <input required type="text" name="address.postalCode" value={formData.businessAddress.postalCode} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:opacity-90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link href="/vendor/login" className="text-primary hover:underline text-sm">
                Already registered? Login here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
