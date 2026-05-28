import React from 'react';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import ProductModel from '@/lib/models/Product';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

async function getProducts() {
  await connectToDatabase();
  const products = await ProductModel.find({}).lean();
  
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
  
  const filteredProducts = filter 
    ? products.filter((product: any) => 
        product.name.toLowerCase().includes(filter) || 
        (product.category && product.category.toLowerCase().includes(filter))
      )
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2 flex items-center gap-3">
            {filter ? (
              <span className="capitalize">{filter}</span>
            ) : (
              'All Products'
            )}
          </h1>
          <p className="text-foreground/60 text-lg">{filteredProducts.length} products available</p>
        </div>
        {filter && (
          <Link href="/products" className="px-5 py-2 bg-foreground text-surface rounded-full shadow-sm hover:opacity-90 transition-opacity text-sm font-bold">
            View All Products
          </Link>
        )}
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-foreground/50 bg-surface rounded-2xl border border-black/5">
          <p className="text-xl mb-4">No products found for "{filter}".</p>
          <Link href="/products" className="text-primary hover:underline">
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
