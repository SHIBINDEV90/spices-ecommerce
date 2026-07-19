import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  vendorReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  vendorReply: { type: String },
}, { timestamps: true });

// Ensure a user can only review a product once
ReviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

delete mongoose.models.Review;
export default mongoose.model<IReview>('Review', ReviewSchema);
