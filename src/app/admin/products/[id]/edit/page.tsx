import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import ProductForm from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await dbConnect();
  
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
      notFound();
  }

  const product = await Product.findById(params.id);
  
  if (!product) {
    notFound();
  }

  return (
    <div className="w-full">
      <ProductForm 
        initialData={JSON.parse(JSON.stringify(product))} 
        productId={params.id}
      />
    </div>
  );
}
