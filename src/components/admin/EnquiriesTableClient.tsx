'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Globe, 
  Mail, 
  Loader2, 
  Package, 
  Trash2, 
  Search, 
  AlertTriangle, 
  X, 
  Check, 
  Filter 
} from 'lucide-react';

interface EnquiriesTableClientProps {
  initialEnquiries: any[];
}

export default function EnquiriesTableClient({ initialEnquiries }: EnquiriesTableClientProps) {
  const [enquiries, setEnquiries] = useState<any[]>(initialEnquiries);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'closed'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Single & Bulk Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    enquiry?: any;
    count?: number;
  }>({ isOpen: false, type: 'single' });

  // Status Colors
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  // Filtered Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const matchesStatus = statusFilter === 'all' || (enq.status || 'pending') === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesStatus;

      const productName = typeof enq.product === 'object' ? enq.product?.name || '' : enq.product || '';
      const matchesSearch =
        (enq.name && enq.name.toLowerCase().includes(query)) ||
        (enq.email && enq.email.toLowerCase().includes(query)) ||
        (enq.company && enq.company.toLowerCase().includes(query)) ||
        (enq.country && enq.country.toLowerCase().includes(query)) ||
        productName.toLowerCase().includes(query) ||
        (enq.quantity && enq.quantity.toLowerCase().includes(query)) ||
        (enq.message && enq.message.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [enquiries, searchQuery, statusFilter]);

  // Counts for status tabs
  const counts = useMemo(() => {
    return {
      all: enquiries.length,
      pending: enquiries.filter(e => (e.status || 'pending') === 'pending').length,
      reviewed: enquiries.filter(e => e.status === 'reviewed').length,
      closed: enquiries.filter(e => e.status === 'closed').length,
    };
  }, [enquiries]);

  // Handle Status Change
  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status.');

      setEnquiries(prev =>
        prev.map(enq => (enq._id === id ? { ...enq, status: newStatus } : enq))
      );
    } catch (error) {
      console.error(error);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Single Delete Modal
  const confirmDeleteSingle = (enquiry: any) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      enquiry,
    });
  };

  // Open Bulk Delete Modal
  const confirmDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: 'bulk',
      count: selectedIds.length,
    });
  };

  // Execute Deletion
  const executeDelete = async () => {
    if (deleteModal.type === 'single' && deleteModal.enquiry) {
      const id = deleteModal.enquiry._id;
      setDeletingId(id);
      try {
        const res = await fetch(`/api/admin/enquiries/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to delete enquiry');
        }

        setEnquiries(prev => prev.filter(enq => enq._id !== id));
        setSelectedIds(prev => prev.filter(selId => selId !== id));
        setDeleteModal({ isOpen: false, type: 'single' });
      } catch (error: any) {
        console.error('Delete error:', error);
        alert(error.message || 'Failed to delete enquiry.');
      } finally {
        setDeletingId(null);
      }
    } else if (deleteModal.type === 'bulk') {
      setIsBulkDeleting(true);
      try {
        const res = await fetch('/api/admin/enquiries', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to delete enquiries');
        }

        setEnquiries(prev => prev.filter(enq => !selectedIds.includes(enq._id)));
        setSelectedIds([]);
        setDeleteModal({ isOpen: false, type: 'bulk' });
      } catch (error: any) {
        console.error('Bulk delete error:', error);
        alert(error.message || 'Failed to delete enquiries.');
      } finally {
        setIsBulkDeleting(false);
      }
    }
  };

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredEnquiries.map(enq => enq._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
            Export Enquiries
          </h2>
          <p className="text-gray-400 mt-1 flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            {enquiries.length} Total Leads Recorded &bull; Filter, respond, or delete unwanted enquiries
          </p>
        </div>

        {/* Global Export Badge */}
        <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20 max-w-md hidden lg:flex items-center gap-3">
          <Globe className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs opacity-90 leading-tight">
            Manage buyer leads from international wholesale trade desks. Delete spam or unwanted requests to keep records clean.
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-lg flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'pending', 'reviewed', 'closed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px] md:min-w-[320px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by buyer, country, commodity..."
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-3 px-5 shadow-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded-lg">
                {selectedIds.length} Selected
              </span>
              <span className="text-xs text-gray-300 hidden sm:inline">
                Enquiries selected for bulk action
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={confirmDeleteBulk}
                className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected ({selectedIds.length})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enquiries Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg">
        <div className="overflow-x-auto min-h-[480px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredEnquiries.length > 0 &&
                      selectedIds.length === filteredEnquiries.length
                    }
                    onChange={handleSelectAll}
                    className="rounded bg-white/10 border-white/20 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    aria-label="Select all enquiries"
                  />
                </th>
                <th className="p-4 font-semibold min-w-[200px]">Buyer Info</th>
                <th className="p-4 font-semibold">Country</th>
                <th className="p-4 font-semibold">Commodity Focus</th>
                <th className="p-4 font-semibold">Volume</th>
                <th className="p-4 font-semibold min-w-[280px]">Requirement</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-16 text-center text-gray-500">
                      <Globe className="w-14 h-14 mx-auto mb-3 opacity-20 text-gray-400" />
                      <p className="text-base font-medium text-gray-300">No enquiries match your filter.</p>
                      <p className="text-xs text-gray-500 mt-1">Try changing the status filter or clearing your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map((enq, index) => {
                    const isSelected = selectedIds.includes(enq._id);
                    const productName = typeof enq.product === 'object' ? enq.product?.name || 'Various' : enq.product || 'Various';

                    return (
                      <motion.tr
                        key={enq._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors group align-top ${
                          isSelected ? 'bg-amber-500/[0.04]' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(enq._id)}
                            className="rounded bg-white/10 border-white/20 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            aria-label={`Select enquiry from ${enq.name}`}
                          />
                        </td>

                        {/* Buyer Info */}
                        <td className="p-4">
                          <p className="font-semibold text-white text-sm">{enq.name}</p>
                          <a
                            href={`mailto:${enq.email}?subject=${encodeURIComponent(`Re: Enquiry for ${productName}`)}`}
                            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-0.5 transition-colors"
                          >
                            <Mail className="w-3 h-3" /> {enq.email}
                          </a>
                          {enq.company && (
                            <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-medium">
                              {enq.company}
                            </p>
                          )}
                        </td>

                        {/* Country */}
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-300 text-xs">
                            <Globe className="w-3.5 h-3.5 text-blue-400 opacity-70" />
                            <span className="font-medium">{enq.country}</span>
                          </div>
                        </td>

                        {/* Commodity Focus */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-emerald-400 opacity-70" />
                            <span className="text-emerald-400 text-xs font-semibold">
                              {productName}
                            </span>
                          </div>
                          {enq.grade && (
                            <p className="text-[11px] text-gray-400 mt-0.5">Grade: {enq.grade}</p>
                          )}
                          {enq.packaging && (
                            <p className="text-[10px] text-gray-500">Pack: {enq.packaging}</p>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="p-4 font-bold text-xs text-amber-400">
                          {enq.quantity}
                        </td>

                        {/* Message */}
                        <td className="p-4">
                          <p className="text-xs text-gray-300 whitespace-normal line-clamp-3 leading-relaxed max-w-[320px]">
                            {enq.message}
                          </p>
                        </td>

                        {/* Status Dropdown */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {updatingId === enq._id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                            ) : (
                              <select
                                value={enq.status || 'pending'}
                                onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                                className={`appearance-none outline-none cursor-pointer px-3 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                                  statusColors[enq.status || 'pending']
                                }`}
                              >
                                <option value="pending" className="bg-neutral-900 text-amber-400">PENDING</option>
                                <option value="reviewed" className="bg-neutral-900 text-blue-400">REVIEWED</option>
                                <option value="closed" className="bg-neutral-900 text-gray-400">CLOSED</option>
                              </select>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(enq.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Action Buttons: Reply & Delete */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Email Reply */}
                            <a
                              href={`mailto:${enq.email}?subject=${encodeURIComponent(`Re: Enquiry for ${productName}`)}`}
                              title="Reply to buyer via Email"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => confirmDeleteSingle(enq)}
                              disabled={deletingId === enq._id}
                              title="Delete unwanted enquiry"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-50"
                            >
                              {deletingId === enq._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white">
                    {deleteModal.type === 'bulk'
                      ? `Delete ${deleteModal.count} Selected Enquiries?`
                      : 'Delete Unwanted Enquiry?'}
                  </h3>

                  {deleteModal.type === 'single' && deleteModal.enquiry ? (
                    <div className="mt-2 text-xs text-gray-300 leading-relaxed bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="font-semibold text-white">
                        {deleteModal.enquiry.name} ({deleteModal.enquiry.country})
                      </p>
                      <p className="text-gray-400 mt-0.5">
                        Commodity:{' '}
                        {typeof deleteModal.enquiry.product === 'object'
                          ? deleteModal.enquiry.product?.name
                          : deleteModal.enquiry.product}
                      </p>
                      <p className="text-amber-400 mt-0.5 font-bold">
                        Volume: {deleteModal.enquiry.quantity}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 mt-2">
                      This will permanently remove {deleteModal.count} selected enquiries and any corresponding notifications from the system.
                    </p>
                  )}

                  <p className="text-xs text-red-400 mt-3 font-medium">
                    ⚠️ This action cannot be reversed.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, type: 'single' })}
                  className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={deletingId !== null || isBulkDeleting}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {deletingId !== null || isBulkDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
