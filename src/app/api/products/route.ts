import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import Product from '../../../lib/models/Product';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  const products = await Product.find({});
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  await connectToDatabase();
  
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    let imageUrl = '';

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `${Date.now()}-${image.name.replace(/\s/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch(e) {
        // Ignore if exists
      }
      
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/products/${filename}`;
    }

    const payload = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      productType: formData.get('productType') as string,
      stock: Number(formData.get('stock')),
      isBulkAvailable: formData.get('isBulkAvailable') === 'true',
      imageUrl: imageUrl || '',
    };

    const product = await Product.create(payload);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}
