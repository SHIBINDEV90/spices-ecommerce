import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db';
import Product from '../../../../lib/models/Product';
import mongoose from 'mongoose';
import { saveUploadedFiles } from '../../../../lib/upload';

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
    
    const rawOriginal = formData.get('originalPrice');
    const payload: any = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      originalPrice: rawOriginal ? Number(rawOriginal) : undefined,
      productType: formData.get('productType') as string,
      stock: Number(formData.get('stock')),
      isBulkAvailable: formData.get('isBulkAvailable') === 'true',
    };

    // Gather all uploaded files from 'images' and 'image' fields
    const filesFromImages = formData.getAll('images') as File[];
    const filesFromImage = formData.getAll('image') as File[];
    const allFiles = [...filesFromImages, ...filesFromImage].filter(
      (f) => f && typeof f === 'object' && typeof (f as any).size === 'number' && f.size > 0
    );

    let existingImages: string[] | null = null;
    const existingRaw = formData.get('existingImages');
    if (existingRaw !== null && typeof existingRaw === 'string') {
      try {
        const parsed = JSON.parse(existingRaw);
        if (Array.isArray(parsed)) existingImages = parsed;
      } catch {
        existingImages = [existingRaw];
      }
    }

    const uploadedUrls = await saveUploadedFiles(allFiles, 'product');

    if (existingImages !== null || uploadedUrls.length > 0) {
      const combined = [...(existingImages || []), ...uploadedUrls];
      payload.images = combined;
      payload.imageUrl = combined[0] || (formData.get('imageUrl') as string) || '';
    } else {
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
