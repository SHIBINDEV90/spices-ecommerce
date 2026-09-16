'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Zap,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Compass,
} from 'lucide-react';

interface VendorEditFormProps {
  initialVendor: any;
  vendorId: string;
}

export default function VendorEditForm({ initialVendor, vendorId }: VendorEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    businessName: initialVendor?.businessName || '',
    ownerName: initialVendor?.ownerName || '',
    email: initialVendor?.email || initialVendor?.userId?.email || '',
    phone: initialVendor?.phone || initialVendor?.userId?.phone || '',
    vendorType: initialVendor?.vendorType || 'Farmer',
    status: initialVendor?.status || 'Pending',
    gstNumber: initialVendor?.gstNumber || '',
    iecNumber: initialVendor?.iecNumber || '',
    profileImage: initialVendor?.profileImage || '',
    businessAddress: {
      street: initialVendor?.businessAddress?.street || '',
      city: initialVendor?.businessAddress?.city || '',
      state: initialVendor?.businessAddress?.state || '',
      country: initialVendor?.businessAddress?.country || 'India',
      postalCode: initialVendor?.businessAddress?.postalCode || '',
    },
    quickCommerce: {
      enabled: initialVendor?.quickCommerce?.enabled ?? false,
      deliveryRadiusKm: initialVendor?.quickCommerce?.deliveryRadiusKm ?? 35,
      preparationTimeMinutes: initialVendor?.quickCommerce?.preparationTimeMinutes ?? 15,
      isAcceptingOrders: initialVendor?.quickCommerce?.isAcceptingOrders ?? true,
    },
    location: {
      type: 'Point',
      coordinates: initialVendor?.location?.coordinates || [76.0389, 11.5561], // [lng, lat]
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      businessAddress: {
        ...prev.businessAddress,
        [field]: value,
      },
    }));
  };

  const handleQuickCommerceChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      quickCommerce: {
        ...prev.quickCommerce,
        [field]: value,
      },
    }));
  };

  const handleCoordinateChange = (index: 0 | 1, value: string) => {
    const num = parseFloat(value);
    const coords: [number, number] = [...formData.location.coordinates] as [number, number];
    coords[index] = isNaN(num) ? 0 : num;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: coords,
      },
    }));
  };

  const setWayanadDefaultCoordinates = () => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [76.0389, 11.5561],
      },
    }));
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: [pos.coords.longitude, pos.coords.latitude],
            },
          }));
        },
        (err) => {
          alert('Could not fetch location: ' + err.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update vendor profile');
      }

      setSuccessMessage('Vendor profile updated successfully!');
      setTimeout(() => {
        router.push('/admin/vendors');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete vendor');
      }

      setShowDeleteModal(false);
      router.push('/admin/vendors');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete vendor');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/vendors"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vendor Management
          </Link>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
            Edit Vendor Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Modify store credentials, address, quick commerce settings, and approval status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm font-medium cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Vendor
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Store & Account Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-lg space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Building className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Store & Business Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Business / Store Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="e.g., Malabar Highlands Organic Spices"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Owner / Representative Name *
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="e.g., Rajesh Nair"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Vendor Type *
              </label>
              <select
                value={formData.vendorType}
                onChange={(e) => handleInputChange('vendorType', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="Farmer" className="bg-neutral-900 text-white">Farmer</option>
                <option value="Exporter" className="bg-neutral-900 text-white">Exporter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Account Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="Pending" className="bg-neutral-900 text-yellow-400">Pending Review</option>
                <option value="Approved" className="bg-neutral-900 text-green-400">Approved</option>
                <option value="Rejected" className="bg-neutral-900 text-red-400">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-white">Contact & Login Credentials</h2>
            </div>
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              Syncs with user account
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="vendor@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for vendor login and email notifications.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="+91 9876543210"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Business Address */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-lg space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <MapPin className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Registered Business Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Street / Building Address *
              </label>
              <input
                type="text"
                required
                value={formData.businessAddress.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Door No, Street Name, Plantation Area"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                City / Town *
              </label>
              <input
                type="text"
                required
                value={formData.businessAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="e.g., Kalpetta, Wayanad"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.businessAddress.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="e.g., Kerala"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Postal / PIN Code *
              </label>
              <input
                type="text"
                required
                value={formData.businessAddress.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="e.g., 673576"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.businessAddress.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="e.g., India"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Quick Commerce Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Quick Commerce (Hyperlocal Delivery)</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.quickCommerce.enabled}
                onChange={(e) => handleQuickCommerceChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-500"></div>
              <span className="ml-3 text-sm font-medium text-gray-300">
                {formData.quickCommerce.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Delivery Radius (km)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.quickCommerce.deliveryRadiusKm}
                onChange={(e) => handleQuickCommerceChange('deliveryRadiusKm', Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 35 km hyperlocal coverage</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Prep Time (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={formData.quickCommerce.preparationTimeMinutes}
                onChange={(e) => handleQuickCommerceChange('preparationTimeMinutes', Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Expected preparation window</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Order Acceptance Status
              </label>
              <select
                value={formData.quickCommerce.isAcceptingOrders ? 'true' : 'false'}
                onChange={(e) => handleQuickCommerceChange('isAcceptingOrders', e.target.value === 'true')}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="true" className="bg-neutral-900 text-green-400">Accepting Orders Now</option>
                <option value="false" className="bg-neutral-900 text-red-400">Temporarily Paused</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Live store availability</p>
            </div>
          </div>
        </div>

        {/* Section 5: Geospatial Coordinates */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-orange-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">Geographic Coordinates (2dsphere)</h2>
                <p className="text-xs text-gray-400">Used for calculating quick-commerce 35 km radius</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={setWayanadDefaultCoordinates}
                className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Preset: Wayanad (Vythiri)
              </button>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 px-3 py-1.5 rounded-lg border border-orange-500/30 transition-colors"
              >
                Use Device GPS
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Longitude (Lng)
              </label>
              <input
                type="number"
                step="any"
                value={formData.location.coordinates[0]}
                onChange={(e) => handleCoordinateChange(0, e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="76.0389"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Latitude (Lat)
              </label>
              <input
                type="number"
                step="any"
                value={formData.location.coordinates[1]}
                onChange={(e) => handleCoordinateChange(1, e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="11.5561"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Compliance & Legal */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-lg space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <FileText className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Tax & Regulatory Numbers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                GSTIN / Tax Registration Number
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="32AAAAA0000A1Z5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                IEC (Import Export Code)
              </label>
              <input
                type="text"
                value={formData.iecNumber}
                onChange={(e) => handleInputChange('iecNumber', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="10-digit IEC Code"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Store Profile / Logo Image URL
              </label>
              <input
                type="text"
                value={formData.profileImage}
                onChange={(e) => handleInputChange('profileImage', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="https://... or /uploads/vendors/..."
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
          <Link
            href="/admin/vendors"
            className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Vendor Profile
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-4 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Vendor Profile?</h3>
                <p className="text-sm text-gray-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/5 text-sm text-gray-300">
              <p>
                You are about to delete <span className="font-semibold text-white">{formData.businessName}</span> (Owner: {formData.ownerName}).
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                <li>All products listed by this vendor will be removed.</li>
                <li>Vendor wallet records and pending balances will be cleared.</li>
                <li>The associated user account role will be downgraded to Customer.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl text-gray-300 bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteVendor}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-500 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
