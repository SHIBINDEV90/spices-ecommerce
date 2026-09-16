'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Edit,
  Trash2,
  Package,
  Zap,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Store,
  ExternalLink,
} from 'lucide-react';

type Vendor = {
  _id: string;
  businessName: string;
  ownerName: string;
  vendorType: 'Farmer' | 'Exporter';
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  productCount?: number;
  email?: string;
  phone?: string;
  profileImage?: string;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  quickCommerce?: {
    enabled?: boolean;
    deliveryRadiusKm?: number;
    preparationTimeMinutes?: number;
    isAcceptingOrders?: boolean;
  };
  userId?: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
};

export default function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  
  // Status update tracking
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Deletion state
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/vendors');
      if (!res.ok) throw new Error('Failed to fetch vendors');
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'Pending' | 'Approved' | 'Rejected') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      // Update local state
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: newStatus } : v))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!vendorToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete vendor');

      setVendors((prev) => prev.filter((v) => v._id !== vendorToDelete._id));
      setVendorToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting vendor');
    } finally {
      setDeleting(false);
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = vendors.length;
    const approved = vendors.filter((v) => v.status === 'Approved').length;
    const pending = vendors.filter((v) => v.status === 'Pending').length;
    const rejected = vendors.filter((v) => v.status === 'Rejected').length;
    return { total, approved, pending, rejected };
  }, [vendors]);

  // Filtering
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesStatus =
        statusFilter === 'All' ? true : vendor.status === statusFilter;

      const contactEmail = vendor.email || vendor.userId?.email || '';
      const contactPhone = vendor.phone || vendor.userId?.phone || '';
      const searchLower = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !searchLower ||
        vendor.businessName?.toLowerCase().includes(searchLower) ||
        vendor.ownerName?.toLowerCase().includes(searchLower) ||
        contactEmail.toLowerCase().includes(searchLower) ||
        contactPhone.toLowerCase().includes(searchLower) ||
        vendor.businessAddress?.city?.toLowerCase().includes(searchLower) ||
        vendor.businessAddress?.state?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [vendors, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Vendors
            </span>
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{metrics.total}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Approved
            </span>
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-400 mt-2">{metrics.approved}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{metrics.pending}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Rejected / Revoked
            </span>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-400 mt-2">{metrics.rejected}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by business name, owner, email, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl self-start md:self-auto overflow-x-auto">
          {(['All', 'Approved', 'Pending', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-semibold">Vendor & Store</th>
                <th className="p-4 font-semibold">Contact Details</th>
                <th className="p-4 font-semibold">Location & Delivery</th>
                <th className="p-4 font-semibold text-center">Products</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-400" />
                    Loading vendor profiles...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    <Store className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-base font-medium text-gray-300">No vendors found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchQuery ? 'Try changing your search term or filter.' : 'No vendors currently registered.'}
                    </p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredVendors.map((vendor, index) => {
                    const contactEmail = vendor.email || vendor.userId?.email || 'N/A';
                    const contactPhone = vendor.phone || vendor.userId?.phone || 'N/A';
                    const cityState = [vendor.businessAddress?.city, vendor.businessAddress?.state]
                      .filter(Boolean)
                      .join(', ') || 'Kerala';

                    return (
                      <motion.tr
                        key={vendor._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        {/* Store Info */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center font-bold text-orange-400 flex-shrink-0 overflow-hidden">
                              {vendor.profileImage ? (
                                <img
                                  src={vendor.profileImage}
                                  alt={vendor.businessName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Building2 className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                <span>{vendor.businessName}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  vendor.vendorType === 'Farmer'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {vendor.vendorType}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <span>Owner:</span>
                                <span className="text-gray-300 font-medium">{vendor.ownerName}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contacts */}
                        <td className="p-4 text-gray-300">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{contactEmail}</span>
                            </div>
                            {contactPhone !== 'N/A' && (
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                <span>{contactPhone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Location / Quick Commerce */}
                        <td className="p-4 text-gray-300">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <MapPin className="w-3.5 h-3.5 text-orange-400/70 flex-shrink-0" />
                              <span className="truncate max-w-[160px]">{cityState}</span>
                            </div>
                            {vendor.quickCommerce?.enabled && (
                              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                                <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                <span>Quick Commerce ({vendor.quickCommerce.deliveryRadiusKm || 35} km)</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Product Count */}
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-200 border border-white/5">
                            <Package className="w-3 h-3 text-orange-400" />
                            {vendor.productCount ?? 0}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                              vendor.status === 'Approved'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : vendor.status === 'Rejected'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                vendor.status === 'Approved'
                                  ? 'bg-green-400'
                                  : vendor.status === 'Rejected'
                                  ? 'bg-red-400'
                                  : 'bg-yellow-400'
                              }`}
                            />
                            {vendor.status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Status Approvals */}
                            {vendor.status === 'Pending' && (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingId === vendor._id}
                                  onClick={() => handleStatusChange(vendor._id, 'Approved')}
                                  className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                                  title="Approve Vendor"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingId === vendor._id}
                                  onClick={() => handleStatusChange(vendor._id, 'Rejected')}
                                  className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                                  title="Reject Vendor"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {vendor.status === 'Approved' && (
                              <button
                                type="button"
                                disabled={updatingId === vendor._id}
                                onClick={() => handleStatusChange(vendor._id, 'Rejected')}
                                className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                                title="Revoke Approval"
                              >
                                Revoke
                              </button>
                            )}

                            {vendor.status === 'Rejected' && (
                              <button
                                type="button"
                                disabled={updatingId === vendor._id}
                                onClick={() => handleStatusChange(vendor._id, 'Approved')}
                                className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                                title="Re-approve Vendor"
                              >
                                Approve
                              </button>
                            )}

                            {/* Edit Vendor Button */}
                            <Link
                              href={`/admin/vendors/${vendor._id}/edit`}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Edit Vendor Profile"
                            >
                              <Edit className="w-4 h-4 text-orange-400" />
                            </Link>

                            {/* Delete Vendor Button */}
                            <button
                              type="button"
                              onClick={() => setVendorToDelete(vendor)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Vendor Profile"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Vendor Confirmation Modal */}
      {vendorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-4 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Vendor Profile?</h3>
                <p className="text-sm text-gray-400">This action permanently deletes this vendor.</p>
              </div>
            </div>

            <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/5 text-sm text-gray-300">
              <p>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-white">{vendorToDelete.businessName}</span>?
              </p>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-1.5 text-xs text-red-300">
                <div className="font-semibold flex items-center gap-1.5 text-red-400">
                  <ShieldAlert className="w-4 h-4" /> Impact Warning:
                </div>
                <div>• {vendorToDelete.productCount ?? 0} listed products will be permanently removed.</div>
                <div>• Vendor wallet & withdrawal records will be cleared.</div>
                <div>• The linked user account role will be downgraded to Customer.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setVendorToDelete(null)}
                className="px-5 py-2.5 rounded-xl text-gray-300 bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
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
