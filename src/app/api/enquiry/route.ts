import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enquiry from '@/lib/models/Enquiry';
import Product from '@/lib/models/Product';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { sendAdminEnquiryNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { product, name, email, country, company, phone, quantity, grade, packaging, message } = body;

    // Basic validation
    if (!product || !name || !email || !country || !quantity || !message) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Resolve product name if product is an ObjectId
    let resolvedProductName = product;
    try {
      if (/^[0-9a-fA-F]{24}$/.test(product)) {
        const prodDoc = await Product.findById(product).select('name');
        if (prodDoc?.name) {
          resolvedProductName = prodDoc.name;
        }
      }
    } catch {
      // Fall back to original product string
    }

    const newEnquiry = new Enquiry({
      product: resolvedProductName,
      name,
      email,
      country,
      company,
      quantity,
      grade,
      packaging,
      message,
      status: 'pending',
    });

    await newEnquiry.save();

    // 1. Create in-app Notification for Admin Dashboard
    try {
      await Notification.create({
        recipientRole: 'Admin',
        type: 'enquiry',
        title: 'New Purchase Enquiry',
        message: `${name} (${country}) requested ${quantity} of ${resolvedProductName}`,
        link: '/admin/enquiries',
        read: false,
        metadata: {
          enquiryId: newEnquiry._id.toString(),
          name,
          email,
          country,
          company: company || '',
          quantity,
          product: resolvedProductName,
        },
      });
    } catch (notifError) {
      console.error('[Enquiry API] Failed to create in-app notification:', notifError);
    }

    // 2. Fetch admin user emails from MongoDB
    let adminEmails: string[] = [];
    try {
      const adminUsers = await User.find({ role: 'Admin' }).select('email');
      adminEmails = adminUsers.map((u: any) => u.email).filter(Boolean);
    } catch (adminErr) {
      console.warn('[Enquiry API] Failed to query admin users:', adminErr);
    }

    // 3. Dispatch Email Notification to Admin
    try {
      await sendAdminEnquiryNotificationEmail({
        enquiryId: newEnquiry._id.toString(),
        product: resolvedProductName,
        name,
        email,
        country,
        company,
        phone,
        quantity,
        grade,
        packaging,
        message,
        adminEmails,
      });
    } catch (emailError) {
      console.error('[Enquiry API] Failed to deliver admin email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Enquiry submitted successfully',
        data: newEnquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Error creating enquiry:', err);
    return NextResponse.json({ success: false, message: `An error occurred: ${err.message}` }, { status: 500 });
  }
}

