import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db';
import Product from '../../../../lib/models/product';
import mongoose from 'mongoose';

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
  
  const body = await request.json();
  let product;
  if (isObjectId) {
    product = await Product.findByIdAndUpdate(id, body, { new: true });
  } else {
    product = await Product.findOneAndUpdate({ slug: id }, body, { new: true });
  }

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
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
