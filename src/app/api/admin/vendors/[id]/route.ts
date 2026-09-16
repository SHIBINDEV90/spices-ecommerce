import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Wallet from '@/lib/models/Wallet';
import Withdrawal from '@/lib/models/Withdrawal';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid vendor ID' }, { status: 400 });
    }

    await dbConnect();

    const vendor = await Vendor.findById(params.id).populate({
      path: 'userId',
      select: 'name email phone role createdAt',
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const productCount = await Product.countDocuments({ vendorId: vendor._id });

    return NextResponse.json({ vendor, productCount });
  } catch (error: any) {
    console.error('Fetch Vendor Details Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handleUpdate(req, params);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handleUpdate(req, params);
}

async function handleUpdate(req: Request, params: { id: string }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid vendor ID' }, { status: 400 });
    }

    await dbConnect();

    const vendor = await Vendor.findById(params.id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      businessName,
      ownerName,
      email,
      phone,
      vendorType,
      status,
      businessAddress,
      quickCommerce,
      location,
      gstNumber,
      iecNumber,
      profileImage,
    } = body;

    // Validate status if provided
    if (status && !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Validate vendorType if provided
    if (vendorType && !['Farmer', 'Exporter'].includes(vendorType)) {
      return NextResponse.json({ error: 'Invalid vendor type' }, { status: 400 });
    }

    // If email is updated, check for collisions
    if (email && email.trim().toLowerCase() !== (vendor.email || '').toLowerCase()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({
        email: cleanEmail,
        _id: { $ne: vendor.userId },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Another user account already exists with this email' },
          { status: 409 }
        );
      }

      vendor.email = cleanEmail;
    }

    // Update vendor fields if present in body
    if (businessName !== undefined) vendor.businessName = businessName.trim();
    if (ownerName !== undefined) vendor.ownerName = ownerName.trim();
    if (phone !== undefined) vendor.phone = phone.trim();
    if (vendorType !== undefined) vendor.vendorType = vendorType;
    if (status !== undefined) vendor.status = status;
    if (gstNumber !== undefined) vendor.gstNumber = gstNumber.trim();
    if (iecNumber !== undefined) vendor.iecNumber = iecNumber.trim();
    if (profileImage !== undefined) vendor.profileImage = profileImage;

    // Update business address
    if (businessAddress) {
      vendor.businessAddress = {
        street: businessAddress.street !== undefined ? businessAddress.street : vendor.businessAddress?.street,
        city: businessAddress.city !== undefined ? businessAddress.city : vendor.businessAddress?.city,
        state: businessAddress.state !== undefined ? businessAddress.state : vendor.businessAddress?.state,
        country: businessAddress.country !== undefined ? businessAddress.country : vendor.businessAddress?.country,
        postalCode: businessAddress.postalCode !== undefined ? businessAddress.postalCode : vendor.businessAddress?.postalCode,
      };
    }

    // Update location coordinates [longitude, latitude]
    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      const [lng, lat] = location.coordinates.map(Number);
      if (!isNaN(lng) && !isNaN(lat)) {
        vendor.location = {
          type: 'Point',
          coordinates: [lng, lat],
        };
      }
    }

    // Update quick commerce settings
    if (quickCommerce) {
      vendor.quickCommerce = {
        enabled: quickCommerce.enabled ?? vendor.quickCommerce?.enabled ?? false,
        deliveryRadiusKm: Number(quickCommerce.deliveryRadiusKm) || vendor.quickCommerce?.deliveryRadiusKm || 35,
        preparationTimeMinutes: Number(quickCommerce.preparationTimeMinutes) || vendor.quickCommerce?.preparationTimeMinutes || 15,
        isAcceptingOrders: quickCommerce.isAcceptingOrders ?? vendor.quickCommerce?.isAcceptingOrders ?? true,
      };
    }

    await vendor.save();

    // Synchronize linked User account if name, email, or phone changed
    if (vendor.userId) {
      const userUpdates: any = {};
      if (ownerName) userUpdates.name = ownerName.trim();
      if (email) userUpdates.email = email.trim().toLowerCase();
      if (phone !== undefined) userUpdates.phone = phone.trim();

      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(vendor.userId, userUpdates);
      }
    }

    const updatedVendor = await Vendor.findById(vendor._id).populate({
      path: 'userId',
      select: 'name email phone role createdAt',
    });

    return NextResponse.json({
      message: 'Vendor profile updated successfully',
      vendor: updatedVendor,
    });
  } catch (error: any) {
    console.error('Update Vendor Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid vendor ID' }, { status: 400 });
    }

    await dbConnect();

    const vendor = await Vendor.findById(params.id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // 1. Delete all products belonging to this vendor
    const deleteProductsResult = await Product.deleteMany({ vendorId: vendor._id });

    // 2. Delete wallet and withdrawals
    await Wallet.deleteMany({ vendorId: vendor._id });
    await Withdrawal.deleteMany({ vendorId: vendor._id });

    // 3. Demote linked User account role from Vendor to Customer
    if (vendor.userId) {
      await User.findByIdAndUpdate(vendor.userId, { role: 'Customer' });
    }

    // 4. Delete the vendor document itself
    await Vendor.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'Vendor profile and associated products deleted successfully',
      deletedProductsCount: deleteProductsResult.deletedCount,
    });
  } catch (error: any) {
    console.error('Delete Vendor Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
