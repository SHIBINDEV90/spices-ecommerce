import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { normalizeShiprocketStatus } from '@/lib/shiprocket';

export const runtime = 'nodejs';

function secureTokenMatches(received: string, expected: string): boolean {
  try {
    const a = Buffer.from(received);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    const received = request.headers.get('x-api-key') || '';

    // If webhook token is configured in env, strictly verify it
    if (expected) {
      if (!received || !secureTokenMatches(received, expected)) {
        console.warn('[Shiprocket Webhook] Unauthorized request signature/token.');
        return NextResponse.json({ error: 'Unauthorized webhook access' }, { status: 401 });
      }
    }

    const body = await request.json();

    // Extract AWB and status from Shiprocket webhook payload
    const awb = String(body.awb || body.awb_code || body.AWB || '').trim();
    const rawStatus = String(body.current_status || body.shipment_status || body.status || '').trim();
    const status = normalizeShiprocketStatus(rawStatus);

    if (!awb || !rawStatus) {
      return NextResponse.json(
        { error: 'Missing AWB or unrecognized shipment status in payload' },
        { status: 400 }
      );
    }

    await dbConnect();
    const order = await Order.findOne({
      $or: [
        { 'shipping.trackingNumber': awb },
        { 'shipping.awbCode': awb },
      ],
    });

    if (!order) {
      console.warn(`[Shiprocket Webhook] No matching order found for AWB: ${awb}`);
      return NextResponse.json({ error: 'No order found for AWB' }, { status: 404 });
    }

    // Idempotency: Event deduplication using event ID or composite hash
    const eventKey = String(
      body.event_id || `${awb}:${rawStatus}:${body.updated_at || body.scanned_date || ''}`
    );

    const alreadyProcessed = (order.trackingHistory || []).some(
      (event: any) => event.eventKey === eventKey
    );

    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Prevent stale events from moving an already delivered or completed order backwards
    if (order.trackingStatus === 'delivered' && status !== 'delivered' && status !== 'returned') {
      return NextResponse.json({ received: true, ignored: 'Order already delivered' });
    }

    order.trackingStatus = status;

    if (body.courier_name && !order.shipping.carrier) {
      order.shipping.carrier = String(body.courier_name);
    }

    if (status === 'shipped' || status === 'in_transit' || status === 'out_for_delivery') {
      order.orderStatus = 'Shipped';
      if (!order.shipping.shippedAt) {
        order.shipping.shippedAt = new Date();
      }
    } else if (status === 'delivered') {
      order.orderStatus = 'Delivered';
      if (!order.shipping.deliveredAt) {
        order.shipping.deliveredAt = new Date();
      }
    } else if (status === 'cancelled') {
      order.orderStatus = 'Cancelled';
    }

    if (!order.trackingHistory) {
      order.trackingHistory = [];
    }

    order.trackingHistory.push({
      status,
      description: body.activity || rawStatus,
      location: String(body.location || body.scanned_location || ''),
      source: 'shiprocket',
      eventKey,
      timestamp: body.updated_at ? new Date(body.updated_at) : new Date(),
    });

    await order.save();

    return NextResponse.json({
      received: true,
      orderId: String(order._id),
      trackingStatus: order.trackingStatus,
    });
  } catch (error: any) {
    console.error('[Shiprocket Webhook Error]:', error);
    return NextResponse.json({ error: 'Unable to process shipping event' }, { status: 500 });
  }
}
