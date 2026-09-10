import { Document, Schema, model, models } from 'mongoose';
import mongoose from 'mongoose';
import { IProduct } from '@/lib/models/Product';

// Interface for a single item within an order
export interface IOrderItem {
  productId: mongoose.Types.ObjectId | IProduct;
  name: string; // Denormalized for order history stability
  quantity: number;
  price: number; // Price at the time of purchase
  vendorId?: mongoose.Types.ObjectId;
  status?: 'Pending' | 'Accepted' | 'Shipped' | 'Delivered';
}

// Interface for the complete order document
export interface IOrder extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderNote?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  products: IOrderItem[];
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'Pending' | 'Paid' | 'Shipped' | 'Delivered';
  paymentMethod?: 'razorpay' | 'stripe' | 'cod';
  paymentGatewayId?: string; // To store Razorpay order ID or Stripe session ID
  paymentId?: string; // To store Razorpay payment ID for auditing
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  status: { type: String, enum: ['Pending', 'Accepted', 'Shipped', 'Delivered'], default: 'Pending' },
});

const OrderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },
    orderNote: { type: String },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    products: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod'],
    },
    paymentGatewayId: { type: String },
    paymentId: { type: String },
  },
  { timestamps: true }
);

const Order = models.Order || model<IOrder>('Order', OrderSchema);

export default Order;
