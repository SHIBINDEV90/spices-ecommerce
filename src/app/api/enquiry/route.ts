import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enquiry from '@/lib/models/Enquiry';
import Product from '@/lib/models/Product';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { product, name, email, country, company, quantity, grade, packaging, message } = body;

    // Basic validation
    if (!product || !name || !email || !country || !quantity || !message) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const newEnquiry = new Enquiry({
        product,
        name,
        email,
        country,
        company,
        quantity,
        grade,
        packaging,
        message,
    });

    await newEnquiry.save();

    // Here you could also trigger an email notification to the admin
    
    return NextResponse.json({ success: true, message: 'Enquiry submitted successfully', data: newEnquiry }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('Error creating enquiry:', err);
    return NextResponse.json({ success: false, message: `An error occurred: ${err.message}` }, { status: 500 });
  }
}
