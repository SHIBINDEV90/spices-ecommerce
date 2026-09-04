'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    productType: 'Spice',
    tax: '',
    pricePerGram: '',
    weight: '',
    packaging: '',
    origin: '',
    shippingDays: '',
    isBulkAvailable: false,
    isRetailAvailable: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from name
      if (name === 'name' && !formData.slug) {
        setFormData(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      data.append('image', imageFile);

      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.error || 'Failed to add product');
      }

      router.push('/vendor/products');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Add New Product</h1>
        <Link href="/vendor/products" className="text-sm text-neutral-500 hover:text-neutral-900">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-8">
        
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Product Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Slug *</label>
              <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Product Type</label>
              <select name="productType" value={formData.productType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="Spice">Spice</option>
                <option value="Blend">Blend</option>
                <option value="Extract">Extract</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description *</label>
              <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Product Image *</label>
              <input required type="file" accept="image/*" name="image" onChange={handleImageChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Selling Price (₹) *</label>
              <input required type="text" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 500" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Original / Offer Price (₹)</label>
              <input type="text" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="Optional e.g. 600" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Price per Gram (₹)</label>
              <input type="text" name="pricePerGram" value={formData.pricePerGram} onChange={handleChange} placeholder="e.g. 0.50" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Stock Quantity</label>
              <input type="text" name="stock" value={formData.stock} onChange={handleChange} placeholder="e.g. 100" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tax (%)</label>
              <input type="text" name="tax" value={formData.tax} onChange={handleChange} placeholder="e.g. 18" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
        </div>

        {/* Shipping & Specs */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b">Shipping & Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Weight/Volume (e.g., 500g, 1kg)</label>
              <input type="text" name="weight" value={formData.weight} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Packaging Type</label>
              <input type="text" name="packaging" value={formData.packaging} onChange={handleChange} placeholder="e.g., Pouch, Glass Jar" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Origin (e.g., Kerala, Idukki)</label>
              <input type="text" name="origin" value={formData.origin} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Estimated Shipping Days</label>
              <input type="number" name="shippingDays" value={formData.shippingDays} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:opacity-90 text-primary-foreground font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}
