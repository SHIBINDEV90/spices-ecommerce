import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Vendor from '@/lib/models/Vendor';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const products = await Product.find({ vendorId: vendor._id }).sort({ createdAt: -1 });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Fetch Vendor Products Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const formData = await req.formData();
    
    // Vendor products require admin approval
    const image = formData.get('image') as File | null;
    let imageUrl = '';

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `vendor-${vendor._id}-${Date.now()}-${image.name.replace(/\s/g, '_')}`;
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

    const parseNumber = (val: any, defaultVal = 0): number => {
      if (val === null || val === undefined || val === '') return defaultVal;
      if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
      const match = String(val).match(/[-+]?[0-9]*\.?[0-9]+/);
      if (match) {
        const parsed = parseFloat(match[0]);
        return isNaN(parsed) ? defaultVal : parsed;
      }
      return defaultVal;
    };

    const rawPricePerGram = formData.get('pricePerGram');
    const rawShippingDays = formData.get('shippingDays');
    const rawOriginalPrice = formData.get('originalPrice');

    const payload = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: parseNumber(formData.get('price'), 0),
      originalPrice: rawOriginalPrice ? parseNumber(rawOriginalPrice, 0) : undefined,
      category: formData.get('category') as string,
      productType: formData.get('productType') as string,
      stock: parseNumber(formData.get('stock'), 0),
      tax: parseNumber(formData.get('tax'), 0),
      pricePerGram: rawPricePerGram ? parseNumber(rawPricePerGram, 0) : undefined,
      weight: formData.get('weight') as string,
      packaging: formData.get('packaging') as string,
      origin: formData.get('origin') as string,
      shippingDays: rawShippingDays ? parseNumber(rawShippingDays, 0) : undefined,
      isBulkAvailable: formData.get('isBulkAvailable') === 'true',
      isRetailAvailable: formData.get('isRetailAvailable') === 'true',
      imageUrl,
      vendorId: vendor._id,
      approvalStatus: 'Pending', 
    };

    const newProduct = await Product.create(payload);

    return NextResponse.json({ message: 'Product created successfully. Pending admin approval.', product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Create Vendor Product Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
