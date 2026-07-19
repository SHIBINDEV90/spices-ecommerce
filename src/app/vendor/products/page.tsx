'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash } from 'lucide-react';

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  approvalStatus: string;
};

export default function VendorProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-neutral-400 hover:text-primary transition-colors">
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button className="text-neutral-400 hover:text-red-600 transition-colors">
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
    </div>
  );
}
