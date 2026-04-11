import React from 'react';
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

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">All Products</h1>
        <p className="text-foreground/60 text-lg">{products.length} products available</p>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-20 text-foreground/50 bg-surface rounded-2xl border border-black/5">
          No products found. Add some from the admin dashboard!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any, index: number) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              index={index} 
              featured={index < 2} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
