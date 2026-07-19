import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const vendor = await Vendor.findOne({ userId: session.user.id });
    if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profileImage: vendor.profileImage || null }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Vendor Profile Image Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: session.user.id });
    if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    let imageUrl = '';

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `vendor-${vendor._id}-${Date.now()}-${image.name.replace(/\s/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'vendors');
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch(e) {
        // Ignore if exists
      }
      
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/vendors/${filename}`;

      // Update Vendor
      vendor.profileImage = imageUrl;
      await vendor.save();
    } else {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Profile image updated successfully', profileImage: imageUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Update Vendor Profile Image Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
