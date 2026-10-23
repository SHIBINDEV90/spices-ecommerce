import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  createShiprocketOrder,
  assignShiprocketAwb,
  getDirectTrackingUrl,
  isShiprocketConfigured,
} from '@/lib/shiprocket';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, courierId } = body;

    if (!orderId) {
      return NextResponse.json({ message: 'Missing orderId' }, { status: 400 });
    }

    if (!isShiprocketConfigured()) {
      return NextResponse.json({
        message: 'Shiprocket credentials are not configured in your .env.local file (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD). Please add them to enable automatic courier dispatch.',
      }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId).populate('products.productId');
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Safeguard against duplicate shipment creation
    if (order.shipping?.shiprocketShipmentId && order.shipping?.awbCode) {
      return NextResponse.json({
        message: `Shipment already exists for this order with AWB: ${order.shipping.awbCode}`,
        order,
      });
    }

    // 1. Create Order in Shiprocket
    const srOrderResult = await createShiprocketOrder(order);
    const srOrderId = String(srOrderResult.order_id || '');
    const srShipmentId = String(srOrderResult.shipment_id || '');

    if (!srShipmentId) {
      throw new Error(`Shiprocket order created (ID: ${srOrderId}) but shipment ID was not returned.`);
    }

    // 2. Assign AWB and Courier
    let awbCode = '';
    let courierName = '';
    try {
      const awbResult = await assignShiprocketAwb(srShipmentId, courierId);
      const awbData = awbResult?.response?.data;
      awbCode = awbData?.awb_code || '';
      courierName = awbData?.courier_name || 'Shiprocket Partner';
    } catch (awbErr: any) {
      console.warn('Shiprocket AWB auto-assignment warning:', awbErr);
    }

    // 3. Update Order in MongoDB
    if (!order.shipping) order.shipping = {} as any;
    order.shipping.shiprocketOrderId = srOrderId;
    order.shipping.shiprocketShipmentId = srShipmentId;

    if (awbCode) {
      order.shipping.awbCode = awbCode;
      order.shipping.trackingNumber = awbCode;
    }
    if (courierName) {
      order.shipping.carrier = courierName;
    }
    if (awbCode) {
      order.shipping.trackingUrl = getDirectTrackingUrl(courierName || 'Shiprocket', awbCode);
    }

    order.trackingStatus = 'packed';
    if (!order.trackingHistory) order.trackingHistory = [];
    order.trackingHistory.push({
      status: 'packed',
      description: awbCode 
        ? `Shipment generated on Shiprocket. Courier ${courierName} assigned with AWB: ${awbCode}` 
        : `Shipment generated on Shiprocket (Shipment ID: ${srShipmentId}). Awaiting courier AWB assignment.`,
      location: 'SpiceWizz Dispatch Hub, Wayanad',
      source: 'shiprocket',
      eventKey: `shiprocket_created_${srShipmentId}`,
      timestamp: new Date(),
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: awbCode
        ? `Shiprocket shipment created with AWB #${awbCode} (${courierName})`
        : `Shiprocket order #${srOrderId} created successfully.`,
      shipment: {
        orderId: srOrderId,
        shipmentId: srShipmentId,
        awbCode,
        courierName,
      },
      order,
    });
  } catch (error: any) {
    console.error('Shiprocket shipment creation error:', error);
    return NextResponse.json({ message: error.message || 'Failed to create shipment on Shiprocket' }, { status: 500 });
  }
}
