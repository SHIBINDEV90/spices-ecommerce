import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Coupon from '@/lib/models/Coupon';
import Wallet from '@/lib/models/Wallet';
import mongoose from 'mongoose';

interface FulfillOrderParams {
  orderId?: string;
  paymentGatewayId?: string;
  paymentId?: string;
  paymentMethod?: 'razorpay' | 'stripe' | 'cod';
}

export async function fulfillOrder({
  orderId,
  paymentGatewayId,
  paymentId,
  paymentMethod,
}: FulfillOrderParams) {
  await dbConnect();

  let order = null;
  if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findById(orderId);
  } else if (paymentGatewayId) {
    order = await Order.findOne({ paymentGatewayId });
  }

  if (!order) {
    console.warn(`[FulfillOrder] Order not found for orderId: ${orderId}, gatewayId: ${paymentGatewayId}`);
    return { success: false, error: 'Order not found' };
  }

  // Idempotency: If already paid, don't duplicate wallet or coupon actions
  if (order.paymentStatus === 'paid') {
    return { success: true, message: 'Order already marked as paid', order };
  }

  // 1. Update Order Status & Tracking
  order.paymentStatus = 'paid';
  order.orderStatus = 'Paid';
  if (paymentMethod) order.paymentMethod = paymentMethod;
  if (paymentId) order.paymentId = paymentId;
  if (paymentGatewayId && !order.paymentGatewayId) order.paymentGatewayId = paymentGatewayId;

  if (!order.trackingStatus || order.trackingStatus === 'processing') {
    order.trackingStatus = 'processing';
  }
  if (!order.trackingHistory) {
    order.trackingHistory = [];
  }
  order.trackingHistory.push({
    status: 'processing',
    description: 'Payment verified successfully. Order confirmed and sent for spice preparation.',
    source: 'system',
    eventKey: `payment_verified_${Date.now()}`,
    timestamp: new Date(),
  });
  await order.save();

  // 2. Increment Coupon Usage if applicable
  if (order.couponCode) {
    try {
      await Coupon.findOneAndUpdate(
        { code: order.couponCode },
        { $inc: { usedCount: 1 } }
      );
    } catch (couponErr) {
      console.error('[FulfillOrder] Error updating coupon used count:', couponErr);
    }
  }

  // 3. Multi-Vendor Wallet Balance Update
  // Calculate vendor earnings and credit pendingBalance
  try {
    const vendorTotals: Record<string, number> = {};
    for (const item of order.products) {
      if (item.vendorId) {
        const vId = item.vendorId.toString();
        const lineTotal = (item.price || 0) * (item.quantity || 1);
        vendorTotals[vId] = (vendorTotals[vId] || 0) + lineTotal;
      }
    }

    for (const [vId, subtotal] of Object.entries(vendorTotals)) {
      const commission = subtotal * 0.10; // 10% platform commission
      const vendorPayout = subtotal - commission;

      await Wallet.findOneAndUpdate(
        { vendorId: new mongoose.Types.ObjectId(vId) },
        { $inc: { pendingBalance: vendorPayout } },
        { upsert: true, new: true }
      );
    }
  } catch (walletErr) {
    console.error('[FulfillOrder] Error updating vendor wallets:', walletErr);
  }

  console.log(`[FulfillOrder] Successfully fulfilled order ${order._id}`);
  return { success: true, order };
}

