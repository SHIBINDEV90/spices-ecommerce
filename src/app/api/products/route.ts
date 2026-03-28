import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import Product from '../../../lib/models/product';

export async function GET() {
  await connectToDatabase();
  const products = await Product.find({});
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const product = await Product.create(body);
  return NextResponse.json(product);
}
