import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import ProductTableClient from '@/components/admin/ProductTableClient';

async function getProducts() {
  await dbConnect();
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(products)); 
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <ProductTableClient initialProducts={products} />
    </div>
  );
}
