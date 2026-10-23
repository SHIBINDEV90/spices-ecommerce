import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  trackShiprocketByAwb,
  normalizeShiprocketStatus,
  isShiprocketConfigured,
} from '@/lib/shiprocket';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, awb } = body;

    await dbConnect();
    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
    } else if (awb) {
      order = await Order.findOne({ 'shipping.trackingNumber': awb });
    }

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const awbCode = awb || order.shipping?.trackingNumber || order.shipping?.awbCode;
    if (!awbCode) {
      return NextResponse.json({ message: 'No AWB tracking code assigned to this order yet' }, { status: 400 });
    }

    if (!isShiprocketConfigured()) {
      return NextResponse.json({
        message: 'Shiprocket credentials are not configured in your .env.local file.',
      }, { status: 400 });
    }

    const trackingData = await trackShiprocketByAwb(awbCode);
    const trackingInfo = trackingData?.tracking_data;

    if (!trackingInfo) {
      return NextResponse.json({
        message: 'No tracking information returned from Shiprocket for this AWB.',
        trackingData,
      });
    }

    const shipmentTrack = Array.isArray(trackingInfo.shipment_track)
      ? trackingInfo.shipment_track[0]
      : trackingInfo.shipment_track;

    const rawStatus = String(shipmentTrack?.current_status || '').trim();
    const normalized = normalizeShiprocketStatus(rawStatus);

    if (normalized) {
      order.trackingStatus = normalized;
      if (normalized === 'shipped' || normalized === 'in_transit' || normalized === 'out_for_delivery') {
        order.orderStatus = 'Shipped';
        if (!order.shipping.shippedAt) order.shipping.shippedAt = new Date();
      } else if (normalized === 'delivered') {
        order.orderStatus = 'Delivered';
        order.shipping.deliveredAt = new Date();
      }
    }

    // Process tracking scans/activities if available
    const scans = trackingInfo.shipment_track_activities || [];
    if (Array.isArray(scans) && scans.length > 0) {
      for (const scan of scans) {
        const scanKey = `sr_${awbCode}_${scan.date}_${scan.activity}`;
        const alreadyExists = order.trackingHistory.some((e: any) => e.eventKey === scanKey);

        if (!alreadyExists) {
          order.trackingHistory.push({
            status: normalizeShiprocketStatus(scan.activity || rawStatus),
            description: scan.activity || rawStatus,
            location: scan.location || '',
            source: 'shiprocket',
            eventKey: scanKey,
            timestamp: scan.date ? new Date(scan.date) : new Date(),
          });
        }
      }
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Live tracking synced. Current courier status: "${rawStatus}"`,
      trackingStatus: order.trackingStatus,
      rawStatus,
      order,
    });
  } catch (error: any) {
    console.error('Shiprocket tracking sync error:', error);
    return NextResponse.json({ message: error.message || 'Failed to sync tracking from Shiprocket' }, { status: 500 });
  }
}
