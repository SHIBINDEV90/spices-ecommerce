import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import Product from '@/lib/models/Product';

export async function GET(req: NextRequest) {
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

    // Fetch vendor's products
    const products = await Product.find({ vendorId: vendor._id })
      .select('_id name price stock imageUrl images quickCommerce category approvalStatus')
      .lean();

    return NextResponse.json({
      success: true,
      vendor: {
        _id: vendor._id,
        businessName: vendor.businessName,
        location: vendor.location || { type: 'Point', coordinates: [76.2999, 9.9312] },
        quickCommerce: vendor.quickCommerce || {
          enabled: false,
          deliveryRadiusKm: 35,
          preparationTimeMinutes: 15,
          isAcceptingOrders: true,
        },
      },
      products,
    });
  } catch (error: any) {
    console.error('Vendor Quick Commerce GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { coordinates, quickCommerce, productSettings } = body;

    // 1. Update vendor store location coordinates if provided
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      const lng = parseFloat(coordinates[0]);
      const lat = parseFloat(coordinates[1]);
      if (!isNaN(lng) && !isNaN(lat)) {
        vendor.location = {
          type: 'Point',
          coordinates: [lng, lat],
        };
      }
    }

    // 2. Update quick commerce operational settings
    if (quickCommerce) {
      const radius = Math.min(35, Math.max(1, parseFloat(quickCommerce.deliveryRadiusKm) || 35));
      const prepMinutes = Math.max(5, parseInt(quickCommerce.preparationTimeMinutes) || 15);

      vendor.quickCommerce = {
        enabled: Boolean(quickCommerce.enabled),
        deliveryRadiusKm: radius,
        preparationTimeMinutes: prepMinutes,
        isAcceptingOrders: Boolean(quickCommerce.isAcceptingOrders),
      };
    }

    await vendor.save();

    // 3. Batch update product quick commerce availability & fast-stock if provided
    if (productSettings && Array.isArray(productSettings)) {
      for (const item of productSettings) {
        if (item.productId) {
          await Product.findOneAndUpdate(
            { _id: item.productId, vendorId: vendor._id },
            {
              $set: {
                'quickCommerce.isAvailable': Boolean(item.isAvailable),
                'quickCommerce.quickStock': parseInt(item.quickStock) || 0,
                'quickCommerce.maxRadiusKm': vendor.quickCommerce?.deliveryRadiusKm || 35,
                'quickCommerce.estimatedPrepMinutes': vendor.quickCommerce?.preparationTimeMinutes || 15,
              },
            }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Quick Commerce settings updated successfully!',
      vendor: {
        location: vendor.location,
        quickCommerce: vendor.quickCommerce,
      },
    });
  } catch (error: any) {
    console.error('Vendor Quick Commerce POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
