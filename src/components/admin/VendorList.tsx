'use client';

import { useState, useEffect } from 'react';

type Vendor = {
  _id: string;
  businessName: string;
  ownerName: string;
  vendorType: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  userId: {
    email: string;
    phone: string;
  };
};

export default function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/admin/vendors');
      if (!res.ok) throw new Error('Failed to fetch vendors');
      const data = await res.json();
      setVendors(data.vendors);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      // Update local state
      setVendors(vendors.map(v => v._id === id ? { ...v, status: newStatus as any } : v));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-neutral-500">Loading vendors...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-neutral-900">Business</th>
              <th className="px-6 py-4 font-semibold text-neutral-900">Contact</th>
              <th className="px-6 py-4 font-semibold text-neutral-900">Type</th>
              <th className="px-6 py-4 font-semibold text-neutral-900">Applied On</th>
              <th className="px-6 py-4 font-semibold text-neutral-900">Status</th>
              <th className="px-6 py-4 font-semibold text-neutral-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {vendors.map((vendor) => (
              <tr key={vendor._id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-neutral-900">{vendor.businessName}</div>
                  <div className="text-xs text-neutral-500">{vendor.ownerName}</div>
                </td>
                <td className="px-6 py-4">
                  <div>{vendor.userId?.email}</div>
                  <div className="text-xs text-neutral-500">{vendor.userId?.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {vendor.vendorType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(vendor.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    vendor.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    vendor.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {vendor.status === 'Pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(vendor._id, 'Approved')}
                        className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusChange(vendor._id, 'Rejected')}
                        className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {vendor.status === 'Approved' && (
                    <button 
                      onClick={() => handleStatusChange(vendor._id, 'Rejected')}
                      className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded font-medium transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                  {vendor.status === 'Rejected' && (
                    <button 
                      onClick={() => handleStatusChange(vendor._id, 'Approved')}
                      className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded font-medium transition-colors"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
