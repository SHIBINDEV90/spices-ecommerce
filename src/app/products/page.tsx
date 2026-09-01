import React from 'react';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import ProductModel from '@/lib/models/Product';
import VendorModel from '@/lib/models/Vendor';
import ProductCard from '@/components/ProductCard';
import { Store, ShieldCheck, Tractor, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProducts() {
  await connectToDatabase();
  // Ensure Vendor model is registered for populate
  if (!VendorModel) {}
  const products = await ProductModel.find({ approvalStatus: 'Approved' })
    .populate('vendorId', 'businessName ownerName vendorType businessAddress status')
    .lean();
  
  // Parse MongoDB documents to plain objects for safe passing to client components
  return JSON.parse(JSON.stringify(products));
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const products = await getProducts();
  const filter = typeof searchParams.filter === 'string' ? searchParams.filter.toLowerCase() : null;
  const source = typeof searchParams.source === 'string' ? searchParams.source.toLowerCase() : 'all';

  // Calculate counts for tabs
  const directCount = products.filter((p: any) => !p.vendorId).length;
  const vendorCount = products.filter((p: any) => !!p.vendorId).length;

  let filteredProducts = products;

  // Filter by Source (Direct vs Vendor)
  if (source === 'direct') {
    filteredProducts = filteredProducts.filter((p: any) => !p.vendorId);
  } else if (source === 'vendors') {
    filteredProducts = filteredProducts.filter((p: any) => !!p.vendorId);
  }

  // Filter by search query / category
  if (filter) {
    filteredProducts = filteredProducts.filter((product: any) => 
      product.name.toLowerCase().includes(filter) || 
      (product.category && product.category.toLowerCase().includes(filter))
    );
  }

  const buildQuery = (newSource?: string, newFilter?: string | null) => {
    const params = new URLSearchParams();
    const s = newSource !== undefined ? newSource : source;
    const f = newFilter !== undefined ? newFilter : filter;
    
    if (s && s !== 'all') params.set('source', s);
    if (f) params.set('filter', f);
    
    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : '/products';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
      {/* Header section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-8">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">
            Catalog & Marketplace
          </span>
          <h1 className="text-4xl font-extrabold text-foreground mb-2 flex items-center gap-3">
            {filter ? (
              <span className="capitalize">{filter}</span>
            ) : source === 'direct' ? (
              'Spicewizz Direct Collection'
            ) : source === 'vendors' ? (
              'Vendor & Farmer Marketplace'
            ) : (
              'All Products'
            )}
          </h1>
          <p className="text-foreground/60 text-lg">
            {filteredProducts.length} products available 
            {source === 'vendors' ? ' directly from local farmers & verified exporters' : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/vendors" 
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-sm transition-all text-sm font-bold flex items-center gap-2"
          >
            <Users size={16} /> Browse Verified Vendors
          </Link>

          {filter && (
            <Link 
              href={buildQuery(undefined, null)} 
              className="px-5 py-2.5 bg-foreground text-surface rounded-full shadow-sm hover:opacity-90 transition-opacity text-sm font-bold"
            >
              Clear Search Filter
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs for Direct vs Vendor Products */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href={buildQuery('all')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            source === 'all'
              ? 'bg-primary text-white shadow-md'
              : 'bg-surface border border-black/10 dark:border-white/10 text-foreground/70 hover:bg-foreground/5'
          }`}
        >
          <Store size={16} /> All Products ({products.length})
        </Link>

        <Link
          href={buildQuery('direct')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            source === 'direct'
              ? 'bg-primary text-white shadow-md'
              : 'bg-surface border border-black/10 dark:border-white/10 text-foreground/70 hover:bg-foreground/5'
          }`}
        >
          <ShieldCheck size={16} /> Spicewizz Direct ({directCount})
        </Link>

        <Link
          href={buildQuery('vendors')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            source === 'vendors'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-surface border border-black/10 dark:border-white/10 text-foreground/70 hover:bg-foreground/5'
          }`}
        >
          <Tractor size={16} /> Vendor Marketplace ({vendorCount})
        </Link>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-foreground/50 bg-surface rounded-2xl border border-black/5">
          <p className="text-xl mb-4">
            No products found 
            {source === 'vendors' ? ' in Vendor Marketplace' : source === 'direct' ? ' in Direct Collection' : ''}
            {filter ? ` for "${filter}"` : ''}.
          </p>
          <Link href="/products" className="text-primary font-bold hover:underline">
            View all available products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product: any, index: number) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              index={index} 
              featured={!filter && index < 2} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

