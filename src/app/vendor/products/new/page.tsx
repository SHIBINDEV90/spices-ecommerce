'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, Star, Trash2, Image as ImageIcon } from 'lucide-react';

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
  const [imageFiles, setImageFiles] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const nextState = { ...prev, [name]: value };

        // Auto-generate slug from name
        if (name === 'name' && !prev.slug) {
          nextState.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }

        // Auto-calculate pricePerGram when price (base price for 1kg) is entered
        if (name === 'price') {
          const numPrice = parseFloat(value);
          if (!isNaN(numPrice) && numPrice > 0) {
            nextState.pricePerGram = (numPrice / 1000).toString();
          } else if (value === '') {
            nextState.pricePerGram = '';
          }
        }

        return nextState;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const added = Array.from(e.target.files).map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      setImageFiles(prev => [...prev, ...added]);
      e.target.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImageFiles(prev => {
      const item = prev.find(img => img.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImageFiles(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setError('Please upload at least one product image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      imageFiles.forEach(img => {
        data.append('images', img.file);
      });

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
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>Product Images *</span>
                  <span className="text-xs text-neutral-400 font-normal">
                    ({imageFiles.length} {imageFiles.length === 1 ? 'image' : 'images'} selected)
                  </span>
                </label>
                <span className="text-xs text-primary font-medium">
                  ★ First image is the Primary Cover
                </span>
              </div>

              {/* Upload Dropzone */}
              <label
                htmlFor="vendor-product-images"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 hover:border-primary/70 rounded-xl bg-neutral-50 hover:bg-neutral-100/70 transition-all cursor-pointer group text-center"
              >
                <input
                  id="vendor-product-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary transition-colors">
                  Click to browse or drag & drop multiple product images
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Supports PNG, JPG, WEBP. You can select multiple files at once.
                </p>
              </label>

              {/* Previews Grid */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {imageFiles.map((item, idx) => {
                    const isPrimary = idx === 0;

                    return (
                      <div
                        key={item.id}
                        className={`relative group aspect-square rounded-xl overflow-hidden border bg-neutral-100 transition-all ${
                          isPrimary ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.preview}
                          alt={`Upload preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {/* Primary Badge or Make Primary */}
                        <div className="absolute top-2 left-2 z-10">
                          {isPrimary ? (
                            <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1 shadow">
                              <Star className="w-3 h-3 fill-current" /> Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(idx)}
                              className="px-2 py-0.5 bg-white/90 hover:bg-white text-neutral-800 text-[10px] font-medium rounded-md shadow-sm opacity-90 hover:opacity-100 transition-all flex items-center gap-1 cursor-pointer"
                              title="Set as primary cover image"
                            >
                              <Star className="w-3 h-3 text-amber-500" /> Cover
                            </button>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(item.id)}
                          className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center shadow transition-all cursor-pointer"
                          title="Remove this image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Bottom index label */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/90 pointer-events-none">
                          <span className="px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                            #{idx + 1}
                          </span>
                          <span className="truncate max-w-[90px] text-neutral-300">
                            {item.file.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        {(() => {
          const numSelling = parseFloat(formData.price.toString() || '0');
          const numOriginal = parseFloat(formData.originalPrice.toString() || '0');
          const computedDiscount = (numOriginal > numSelling && numSelling > 0)
            ? Math.round(((numOriginal - numSelling) / numOriginal) * 100)
            : 0;
          const computedPerGram = (numSelling > 0)
            ? (numSelling / 1000).toFixed(2)
            : '0.00';

          return (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b flex items-center justify-between">
                <span>Pricing & Inventory</span>
                {computedDiscount > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
                    🎉 {computedDiscount}% OFF Badge Active
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Selling Price (₹) *</label>
                  <input required type="text" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 500" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                  <span className="text-[11px] text-neutral-500 mt-1 block">Base price for 1kg (1000g)</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Original / Offer Price (₹)</label>
                  <input type="text" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="Optional e.g. 600" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
                  {computedDiscount > 0 ? (
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                      Offer Percentage: <strong className="text-emerald-700">{computedDiscount}% OFF</strong> (Save ₹{numOriginal - numSelling})
                    </span>
                  ) : numOriginal > 0 && numOriginal <= numSelling ? (
                    <span className="text-[11px] text-amber-600 font-medium mt-1 block">
                      Must be higher than ₹{numSelling} for offer badge.
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500 mt-1 block">MRP / Strikethrough price</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Price per Gram (₹)</label>
                  <input type="text" name="pricePerGram" value={formData.pricePerGram} onChange={handleChange} placeholder="e.g. 0.50" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none bg-neutral-50" />
                  <span className="text-[11px] text-primary font-medium mt-1 block">
                    ⚡ Auto-calculated: ₹{computedPerGram}/g
                  </span>
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
          );
        })()}

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
