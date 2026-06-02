import mongoose, { Document, Schema, model, models } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number; // Optional, useful for percentage discounts
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minimumOrderAmount: { type: Number, default: 0, min: 0 },
    maximumDiscount: { type: Number, min: 0 },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, required: true, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = models.Coupon || model<ICoupon>('Coupon', CouponSchema);

export default Coupon;
