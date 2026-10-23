import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDirectTrackingUrl } from '@/lib/shiprocket';

const allowedStatuses = [
  'processing',
  'packed',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'exception',
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id: orderId } = params;
    const body = await request.json();
    const {
      status,
      description,
      carrier,
      trackingNumber,
      trackingUrl,
      location,
      estimatedDeliveryDate,
    } = body;

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid tracking status' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (!order.shipping) {
      order.shipping = {} as any;
    }
    if (!order.trackingHistory) {
      order.trackingHistory = [];
    }

    if (carrier !== undefined) {
      order.shipping.carrier = carrier.trim();
    }
    if (trackingNumber !== undefined) {
      order.shipping.trackingNumber = trackingNumber.trim();
      order.shipping.awbCode = trackingNumber.trim();
    }

    // Auto-generate tracking URL if not provided but carrier & tracking number exist
    if (trackingUrl !== undefined && trackingUrl.trim()) {
      order.shipping.trackingUrl = trackingUrl.trim();
    } else if (order.shipping.trackingNumber && !order.shipping.trackingUrl) {
      order.shipping.trackingUrl = getDirectTrackingUrl(order.shipping.carrier, order.shipping.trackingNumber);
    }

    if (estimatedDeliveryDate) {
      order.shipping.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    }

    const newStatus = status || order.trackingStatus || 'processing';
    order.trackingStatus = newStatus;

    // Synchronize legacy orderStatus field for backwards compatibility
    if (newStatus === 'shipped' || newStatus === 'in_transit' || newStatus === 'out_for_delivery') {
      order.orderStatus = 'Shipped';
      if (!order.shipping.shippedAt) {
        order.shipping.shippedAt = new Date();
      }
    } else if (newStatus === 'delivered') {
      order.orderStatus = 'Delivered';
      order.shipping.deliveredAt = new Date();
    } else if (newStatus === 'cancelled') {
      order.orderStatus = 'Cancelled';
    } else if (newStatus === 'processing' || newStatus === 'packed') {
      if (order.paymentStatus === 'paid') {
        order.orderStatus = 'Paid';
      }
    }

    // Append new tracking history entry
    const defaultDescriptions: Record<string, string> = {
      processing: 'Order is being processed and spices are being weighed and prepared.',
      packed: 'Artisanal spices packed securely in aroma-lock pouches.',
      shipped: `Package picked up by courier${order.shipping.carrier ? ` (${order.shipping.carrier})` : ''}.`,
      in_transit: 'Package in transit through logistics sorting centers.',
      out_for_delivery: 'Package is out for delivery to customer destination.',
      delivered: 'Package successfully delivered to customer.',
      cancelled: 'Order has been cancelled.',
      returned: 'Shipment returned to origin facility.',
      exception: 'Shipment encountered an exception during transit.',
    };

    order.trackingHistory.push({
      status: newStatus,
      description: description || defaultDescriptions[newStatus] || `Order status updated to ${newStatus}`,
      location: location || '',
      source: 'admin',
      eventKey: `admin:${newStatus}:${Date.now()}`,
      timestamp: new Date(),
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Tracking details updated successfully',
      trackingStatus: order.trackingStatus,
      shipping: order.shipping,
      trackingHistory: order.trackingHistory,
      order,
    });
  } catch (error: any) {
    console.error('Admin tracking update failed:', error);
    return NextResponse.json({ message: error.message || 'Unable to update tracking' }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const order = await Order.findById(params.id).lean();
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      orderId: String(order._id),
      trackingStatus: (order as any).trackingStatus || 'processing',
      shipping: (order as any).shipping || {},
      history: (order as any).trackingHistory || [],
    });
  } catch (error: any) {
    console.error('Admin tracking lookup failed:', error);
    return NextResponse.json({ message: 'Unable to load tracking details' }, { status: 500 });
  }
}
