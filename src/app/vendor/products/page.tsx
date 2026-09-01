'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  approvalStatus: string;
  weight?: string;
};

// Share Product Modal Component
function ShareProductModal({ 
  product, 
  onClose 
}: { 
  product: Product; 
  onClose: () => void; 
}) {
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourwebsite.com';
  const productUrl = `${origin}/products/${product._id}`;
  const weightInfo = product.weight ? `/${product.weight}` : '';
  const messageText = `Hello! I would like to share this product with you.

${product.name}

Price: ₹${product.price.toLocaleString('en-IN')}${weightInfo}

View Product:
${productUrl}

Thank you!`;

  const handleShare = () => {
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
      cleanedPhone = '91' + cleanedPhone;
    }
    
    const url = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
      />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10 border border-neutral-100 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center space-x-2 text-primary">
            <Share2 className="w-5 h-5" />
            <h3 className="font-bold text-lg text-neutral-900">Share Product</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Product details preview card */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex flex-col gap-1">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Product Info</span>
            <span className="font-bold text-neutral-900 text-base">{product.name}</span>
            <span className="text-sm font-semibold text-primary">
              ₹{product.price.toLocaleString('en-IN')}{product.weight ? ` / ${product.weight}` : ''}
            </span>
          </div>

          {/* Phone input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="customer-phone" className="text-sm font-semibold text-neutral-700">
              Customer Mobile Number
            </label>
            <div className="relative rounded-lg shadow-sm">
              <input
                id="customer-phone"
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="e.g. 9876543210 or +919876543210"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              Tip: Enter customer's 10-digit number. We'll auto-prefix +91 (India) if no country code is provided.
            </p>
          </div>

          {/* Live message preview */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-neutral-700">WhatsApp Message Preview</span>
            <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 text-xs text-neutral-700 font-mono whitespace-pre-wrap leading-relaxed relative">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/30">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all"
          >
            {copied ? 'Copied Link!' : 'Copy Link Only'}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!phone.trim()}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                phone.trim() 
                  ? 'bg-primary text-white hover:opacity-95 shadow-sm shadow-primary/20 cursor-pointer' 
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VendorProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/vendor/products');
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        setProducts(data.products);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/vendor/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-neutral-500">Loading products...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
        <Link 
          href="/vendor/products/new" 
          className="flex items-center space-x-2 bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-neutral-900">Product Name</th>
                <th className="px-6 py-4 font-semibold text-neutral-900">Category</th>
                <th className="px-6 py-4 font-semibold text-neutral-900">Price</th>
                <th className="px-6 py-4 font-semibold text-neutral-900">Stock</th>
                <th className="px-6 py-4 font-semibold text-neutral-900">Status</th>
                <th className="px-6 py-4 font-semibold text-neutral-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">{product.name}</td>
                  <td className="px-6 py-4">{product.category || 'N/A'}</td>
                  <td className="px-6 py-4">₹{product.price}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                      product.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3 text-nowrap">
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="text-neutral-400 hover:text-green-600 transition-colors cursor-pointer"
                      title="Share Product"
                    >
                      <Share2 className="w-4 h-4 inline" />
                    </button>
                    <Link 
                      href={`/vendor/products/${product._id}/edit`}
                      className="text-neutral-400 hover:text-primary transition-colors cursor-pointer inline-block"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteProduct(product._id, product.name)}
                      className="text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    You haven't added any products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ShareProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
