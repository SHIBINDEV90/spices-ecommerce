import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';

export const dynamic = 'force-dynamic';

const sampleProducts = [
  {
    name: 'Bulk Black Pepper',
    slug: 'bulk-black-pepper',
    description: 'High-quality, pungent Malabar black pepper available in vast quantities for global export. Known as the "King of Spices", perfect for industrial grinding and processing.',
    price: 8.5,
    productType: 'Spice',
    stock: 5000,
    isBulkAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596500588661-d70cb9e224e7?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Premium Cloves',
    slug: 'premium-cloves',
    description: 'Aromatic flower buds with a distinct flavor. Sourced from the finest farms in Kerala.',
    price: 15,
    productType: 'Spice',
    stock: 300,
    isBulkAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1616400613204-74c0c29f60fc?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Green Cardamom',
    slug: 'green-cardamom',
    description: 'Fresh and aromatic green cardamom from the hills of Kerala. Perfect for culinary and medicinal uses.',
    price: 25,
    productType: 'Spice',
    stock: 1000,
    isBulkAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1621251785573-00e1cc26c2e3?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Turmeric Fingers',
    slug: 'turmeric-fingers',
    description: 'Dried turmeric rhizomes with a high curcumin content. Ideal for grinding into powder.',
    price: 12,
    productType: 'Spice',
    stock: 2000,
    isBulkAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1615486171434-19266782c3c6?q=80&w=800&auto=format&fit=crop',
  }
];

export async function GET() {
  // This route should only be accessible in a development environment.
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, message: 'Seeding is only available in development mode.' },
      { status: 403 }
    );
  }

  await dbConnect();

  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    // Insert new sample products
    await Product.insertMany(sampleProducts);
    console.log('Inserted sample products.');

    return NextResponse.json(
      { 
        success: true, 
        message: `Database seeded successfully with ${sampleProducts.length} products.` 
      },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Error seeding database:', err);
    return NextResponse.json(
      { success: false, message: `An error occurred while seeding: ${err.message}` },
      { status: 500 }
    );
  }
}
