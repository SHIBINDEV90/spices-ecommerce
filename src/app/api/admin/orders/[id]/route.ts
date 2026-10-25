import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const order = await Order.findById(params.id)
      .populate('products.vendorId', 'businessName ownerName email phone vendorType');

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Fetch Order Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const deletedOrder = await Order.findByIdAndDelete(params.id);

    if (!deletedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    console.log(`[Admin Order Deletion] Order ${params.id} was permanently deleted by Admin ${session.user?.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Order deleted successfully',
      orderId: params.id 
    });
  } catch (error: any) {
    console.error('Delete Order Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { deliveryType, estimatedDeliveryMinutes } = body;

    if (!deliveryType || !['standard', 'quick'].includes(deliveryType)) {
      return NextResponse.json(
        { message: 'Invalid deliveryType. Must be either "standard" or "quick".' },
        { status: 400 }
      );
    }

    await dbConnect();
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const previousType = order.deliveryType || 'standard';
    order.deliveryType = deliveryType;

    if (deliveryType === 'quick') {
      order.estimatedDeliveryMinutes = estimatedDeliveryMinutes || order.estimatedDeliveryMinutes || 180;
    } else {
      // standard shipping
      if (estimatedDeliveryMinutes !== undefined) {
        order.estimatedDeliveryMinutes = estimatedDeliveryMinutes;
      }
    }

    // Add checkpoint in tracking history
    if (!Array.isArray(order.trackingHistory)) {
      order.trackingHistory = [];
    }

    order.trackingHistory.push({
      status: order.trackingStatus || 'processing',
      description: `Delivery channel specified as ${
        deliveryType === 'quick' ? '⚡ Quick Commerce (Express 3-Hour Delivery)' : '📦 Standard Courier Shipping'
      } by Admin (previously ${previousType === 'quick' ? 'Quick Commerce' : 'Standard'}).`,
      source: 'admin',
      location: 'Admin Portal',
      timestamp: new Date(),
    } as any);

    await order.save();

    const populatedOrder = await Order.findById(params.id)
      .populate('products.vendorId', 'businessName ownerName email phone vendorType')
      .lean();

    return NextResponse.json({
      success: true,
      message: `Order #${params.id.slice(-6).toUpperCase()} specified as ${
        deliveryType === 'quick' ? 'Quick Commerce (3-Hour Express)' : 'Standard Courier'
      }`,
      order: populatedOrder,
    });
  } catch (error: any) {
    console.error('Update Delivery Type Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
