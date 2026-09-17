import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Vendor from '@/lib/models/Vendor';
import path from 'path';
import { saveUploadedFiles } from '@/lib/upload';

export const dynamic = 'force-dynamic';

// GET single vendor product by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const product = await Product.findOne({ _id: params.id, vendorId: vendor._id });
    if (!product) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Fetch Vendor Product Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT / Update vendor product
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const existingProduct = await Product.findOne({ _id: params.id, vendorId: vendor._id });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    const formData = await req.formData();
    
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

    const uploadedUrls = await saveUploadedFiles(allFiles, `vendor-${vendor._id}`);

    let imageUrl = existingProduct.imageUrl;
    let images: string[] = existingProduct.images && existingProduct.images.length > 0
      ? existingProduct.images
      : (existingProduct.imageUrl ? [existingProduct.imageUrl] : []);

    if (existingImages !== null || uploadedUrls.length > 0) {
      images = [...(existingImages || []), ...uploadedUrls];
      imageUrl = images[0] || '';
    }

    const parseNumber = (val: any, defaultVal: number): number => {
      if (val === null || val === undefined || val === '') return defaultVal;
      if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
      const match = String(val).match(/[-+]?[0-9]*\.?[0-9]+/);
      if (match) {
        const parsed = parseFloat(match[0]);
        return isNaN(parsed) ? defaultVal : parsed;
      }
      return defaultVal;
    };

    const name = formData.get('name') as string || existingProduct.name;
    const slug = formData.get('slug') as string || existingProduct.slug;
    const description = formData.get('description') as string || existingProduct.description;
    const price = formData.has('price') ? parseNumber(formData.get('price'), existingProduct.price) : existingProduct.price;
    const originalPrice = formData.has('originalPrice') ? parseNumber(formData.get('originalPrice'), existingProduct.originalPrice || 0) : existingProduct.originalPrice;
    const category = formData.get('category') as string || existingProduct.category;
    const productType = formData.get('productType') as string || existingProduct.productType;
    const stock = formData.has('stock') ? parseNumber(formData.get('stock'), existingProduct.stock) : existingProduct.stock;
    const tax = formData.has('tax') ? parseNumber(formData.get('tax'), existingProduct.tax || 0) : existingProduct.tax;
    const pricePerGram = formData.has('pricePerGram') ? parseNumber(formData.get('pricePerGram'), existingProduct.pricePerGram || 0) : existingProduct.pricePerGram;
    const weight = formData.get('weight') as string || existingProduct.weight;
    const packaging = formData.get('packaging') as string || existingProduct.packaging;
    const origin = formData.get('origin') as string || existingProduct.origin;
    const shippingDays = formData.has('shippingDays') ? parseNumber(formData.get('shippingDays'), existingProduct.shippingDays || 0) : existingProduct.shippingDays;
    const isBulkAvailable = formData.has('isBulkAvailable') ? formData.get('isBulkAvailable') === 'true' : existingProduct.isBulkAvailable;
    const isRetailAvailable = formData.has('isRetailAvailable') ? formData.get('isRetailAvailable') === 'true' : existingProduct.isRetailAvailable;
    const rating = formData.has('rating')
      ? Math.max(1, Math.min(5, Number(parseNumber(formData.get('rating'), existingProduct.rating || 5).toFixed(1))))
      : existingProduct.rating;

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
        name,
        slug,
        description,
        price,
        originalPrice: (originalPrice && originalPrice > 0) ? originalPrice : undefined,
        category,
        productType,
        stock,
        tax,
        pricePerGram,
        weight,
        packaging,
        origin,
        shippingDays,
        isBulkAvailable,
        isRetailAvailable,
        rating,
        imageUrl,
        images,
      },
      { new: true }
    );

    return NextResponse.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error: any) {
    console.error('Update Vendor Product Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE vendor product
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const product = await Product.findOneAndDelete({ _id: params.id, vendorId: vendor._id });
    if (!product) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete Vendor Product Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
