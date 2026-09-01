'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function EditVendorProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
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
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/vendor/products/${params.id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch product details');
        }
        const data = await res.json();
        const p = data.product;

        setFormData({
          name: p.name || '',
          slug: p.slug || '',
          description: p.description || '',
          price: p.price !== undefined ? p.price.toString() : '',
          category: p.category || '',
          stock: p.stock !== undefined ? p.stock.toString() : '',
          productType: p.productType || 'Spice',
          tax: p.tax !== undefined ? p.tax.toString() : '',
          pricePerGram: p.pricePerGram !== undefined ? p.pricePerGram.toString() : '',
          weight: p.weight || '',
          packaging: p.packaging || '',
          origin: p.origin || '',
          shippingDays: p.shippingDays !== undefined ? p.shippingDays.toString() : '',
          isBulkAvailable: !!p.isBulkAvailable,
          isRetailAvailable: p.isRetailAvailable !== undefined ? !!p.isRetailAvailable : true,
        });

        if (p.imageUrl) {
          setCurrentImageUrl(p.imageUrl);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch(`/api/vendor/products/${params.id}`, {
        method: 'PUT',
        body: data,
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.error || 'Failed to update product');
      }

      router.push('/vendor/products');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-neutral-500">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Edit Product</h1>
        <Link href="/vendor/products" className="text-sm font-semibold text-neutral-500 hover:text-neutral-900">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-8 border border-neutral-100">
        
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Product Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Slug *</label>
              <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Product Type</label>
              <select name="productType" value={formData.productType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm">
                <option value="Spice">Spice</option>
                <option value="Blend">Blend</option>
                <option value="Extract">Extract</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description *</label>
              <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm"></textarea>
            </div>
            
            {/* Image Preview & Upload */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-medium text-neutral-700">Product Image</label>
              {currentImageUrl && !imageFile && (
                <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 w-fit">
                  <div className="relative w-16 h-16 rounded overflow-hidden">
                    <Image
                      src={currentImageUrl}
                      alt="Current Product Image"
                      fill
                      className="object-cover"
                      unoptimized={currentImageUrl.startsWith('/uploads/')}
                    />
                  </div>
                  <span className="text-xs text-neutral-500">Current product image</span>
                </div>
              )}
              <input type="file" accept="image/*" name="image" onChange={handleImageChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
              <p className="text-xs text-neutral-400">Leave blank to keep the current image, or select a new file to replace it.</p>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Price (₹) *</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Price per Gram (₹)</label>
              <input type="number" step="0.01" name="pricePerGram" value={formData.pricePerGram} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Stock Quantity</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tax (%)</label>
              <input type="number" step="0.1" name="tax" value={formData.tax} onChange={handleChange} placeholder="e.g. 18" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
          </div>
        </div>

        {/* Shipping & Specs */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b">Shipping & Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Weight/Volume (e.g., 500g, 1kg)</label>
              <input type="text" name="weight" value={formData.weight} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Packaging Type</label>
              <input type="text" name="packaging" value={formData.packaging} onChange={handleChange} placeholder="e.g., Pouch, Glass Jar" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Origin (e.g., Kerala, Idukki)</label>
              <input type="text" name="origin" value={formData.origin} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Estimated Shipping Days</label>
              <input type="number" name="shippingDays" value={formData.shippingDays} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t">
          <Link
            href="/vendor/products"
            className="px-5 py-2.5 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:opacity-90 text-primary-foreground font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-sm shadow-sm"
          >
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
