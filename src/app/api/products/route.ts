import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import Product from '../../../lib/models/Product';
import Vendor from '../../../lib/models/Vendor';
import { saveUploadedFiles } from '../../../lib/upload';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  // Ensure Vendor model is registered for populate
  if (!Vendor) {}
  const products = await Product.find({ approvalStatus: 'Approved' }).populate('vendorId', 'businessName ownerName vendorType businessAddress status');
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  await connectToDatabase();
  
  try {
    const formData = await request.formData();
    
    // Gather all uploaded files from 'images' and 'image' fields
    const filesFromImages = formData.getAll('images') as File[];
    const filesFromImage = formData.getAll('image') as File[];
    const allFiles = [...filesFromImages, ...filesFromImage].filter(
      (f) => f && typeof f === 'object' && typeof (f as any).size === 'number' && f.size > 0
    );

    // Existing images (if passed as JSON array or single string)
    let existingImages: string[] = [];
    const existingRaw = formData.get('existingImages');
    if (existingRaw && typeof existingRaw === 'string') {
      try {
        const parsed = JSON.parse(existingRaw);
        if (Array.isArray(parsed)) existingImages = parsed;
      } catch {
        existingImages = [existingRaw];
      }
    }

    const uploadedUrls = await saveUploadedFiles(allFiles, 'product');
    const images = [...existingImages, ...uploadedUrls];
    const imageUrl = images[0] || (formData.get('imageUrl') as string) || '';

    const rawOriginal = formData.get('originalPrice');
    const payload = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      originalPrice: rawOriginal ? Number(rawOriginal) : undefined,
      productType: formData.get('productType') as string,
      stock: Number(formData.get('stock')),
      isBulkAvailable: formData.get('isBulkAvailable') === 'true',
      imageUrl,
      images,
    };

    const product = await Product.create(payload);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}
