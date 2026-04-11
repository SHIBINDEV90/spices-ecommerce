import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db';
import Product from '../../../../lib/models/Product';
import mongoose from 'mongoose';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  
  let product;
  if (isObjectId) {
    product = await Product.findById(id);
  } else {
    product = await Product.findOne({ slug: id });
  }

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  
  try {
    const formData = await request.formData();
    
    // Base payload
    const payload: any = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      productType: formData.get('productType') as string,
      stock: Number(formData.get('stock')),
      isBulkAvailable: formData.get('isBulkAvailable') === 'true',
    };

    // If an image file was supplied, save it
    const image = formData.get('image') as File | null;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `${Date.now()}-${image.name.replace(/\s/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch(e) {}
      
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      payload.imageUrl = `/uploads/products/${filename}`;
    } else {
      // If no new image, we might receive the old imageUrl as a string fallback
      const oldImageUrl = formData.get('imageUrl') as string | null;
      if (oldImageUrl) {
        payload.imageUrl = oldImageUrl;
      }
    }

    let product;
    if (isObjectId) {
      product = await Product.findByIdAndUpdate(id, payload, { new: true });
    } else {
      product = await Product.findOneAndUpdate({ slug: id }, payload, { new: true });
    }

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch(error: any) {
    console.error("Product update error:", error);
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  const isObjectId = mongoose.Types.ObjectId.isValid(id);

  let product;
  if (isObjectId) {
    product = await Product.findByIdAndDelete(id);
  } else {
    product = await Product.findOneAndDelete({ slug: id });
  }

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Product deleted successfully' });
}
