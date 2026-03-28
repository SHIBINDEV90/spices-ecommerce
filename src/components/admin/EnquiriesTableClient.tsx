'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Globe, CheckCircle, Mail, Loader2, Package } from 'lucide-react';

interface EnquiriesTableClientProps {
  initialEnquiries: any[];
}

export default function EnquiriesTableClient({ initialEnquiries }: EnquiriesTableClientProps) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status.');
      
      setEnquiries(prev => prev.map(enq => 
        enq._id === id ? { ...enq, status: newStatus } : enq
      ));
    } catch (error) {
      console.error(error);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="absolute top-0 right-0 p-4 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20 max-w-sm hidden lg:block">
        <h4 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4" /> Export Operations</h4>
        <p className="text-xs opacity-80 mt-1">This is your primary hub for identifying high-value bulk buyers across the globe. Respond quickly to secure contracts.</p>
      </div>

      <div className="flex justify-between items-center pr-0 lg:pr-[400px]">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
            Export Enquiries
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {enquiries.length} Business Leads
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg mt-8">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-sm">
                <th className="p-4 font-medium min-w-[200px]">Contact Info</th>
                <th className="p-4 font-medium">Country</th>
                <th className="p-4 font-medium">Product Focus</th>
                <th className="p-4 font-medium">Quantity</th>
                <th className="p-4 font-medium min-w-[300px]">Message</th>
                <th className="p-4 font-medium">Status & Action</th>
                <th className="p-4 font-medium text-right">Date Recv</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500">
                      <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">No export enquiries found.</p>
                      <p className="text-sm">Organic global leads will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enq, index) => (
                    <motion.tr 
                      key={enq._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group align-top"
                    >
                      <td className="p-4">
                        <p className="font-medium text-white">{enq.name}</p>
                        <a href={`mailto:${enq.email}`} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 mt-1 transition-colors">
                          <Mail className="w-3 h-3" /> {enq.email}
                        </a>
                        {enq.company && <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{enq.company}</p>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Globe className="w-4 h-4 opacity-50 text-blue-400" />
                          <span className="font-medium">{enq.country}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 opacity-50 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">{enq.product?.name || 'Various'}</span>
                        </div>
                        {enq.grade && <p className="text-xs text-gray-500 mt-1">Grade: {enq.grade}</p>}
                      </td>
                      <td className="p-4 font-medium text-amber-400">
                        {enq.quantity}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-400 whitespace-normal line-clamp-3 leading-relaxed w-[300px]">
                          {enq.message}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 relative">
                          {updatingId === enq._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                          ) : (
                            <select
                              value={enq.status || 'pending'}
                              onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                              className={`appearance-none outline-none cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md border transition-all ${statusColors[enq.status || 'pending']}`}
                            >
                              <option value="pending" className="bg-gray-800 text-amber-400">PENDING</option>
                              <option value="reviewed" className="bg-gray-800 text-blue-400">REVIEWED</option>
                              <option value="closed" className="bg-gray-800 text-gray-400">CLOSED</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right text-sm text-gray-500">
                        {new Date(enq.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
