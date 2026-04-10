import { Document, Schema, model, models } from 'mongoose';
import mongoose from 'mongoose';
import { IProduct } from '@/lib/models/Product';

// Interface for a single item within an order
export interface IOrderItem {
  productId: mongoose.Types.ObjectId | IProduct;
  name: string; // Denormalized for order history stability
  quantity: number;
  price: number; // Price at the time of purchase
}

// Interface for the complete order document
export interface IOrder extends Document {
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  products: IOrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'Pending' | 'Paid' | 'Shipped' | 'Delivered';
  paymentGatewayId?: string; // To store Razorpay/Stripe order ID
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    products: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
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
    paymentGatewayId: { type: String },
  },
  { timestamps: true }
);

const Order = models.Order || model<IOrder>('Order', OrderSchema);

export default Order;
