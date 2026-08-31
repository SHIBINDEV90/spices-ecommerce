import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  productType: string;
  stock: number;
  isBulkAvailable: boolean;
  isRetailAvailable: boolean;
  vendorId?: mongoose.Types.ObjectId;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  category?: string;
  discount?: number;
  sku?: string;
  weight?: string;
  packaging?: string;
  origin?: string;
  exportAvailable?: boolean;
  shippingDays?: number;
  tax?: number;
  pricePerGram?: number;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  productType: { type: String, required: true, default: 'Spice' },
  stock: { type: Number, default: 0 },
  isBulkAvailable: { type: Boolean, default: false },
  isRetailAvailable: { type: Boolean, default: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' }, // Default to Approved for backward compatibility with existing products
  category: { type: String },
  discount: { type: Number, default: 0 },
  sku: { type: String },
  tax: { type: Number, default: 0 },
  pricePerGram: { type: Number },
  weight: { type: String },
  packaging: { type: String },
  origin: { type: String },
  exportAvailable: { type: Boolean, default: false },
  shippingDays: { type: Number },
}, { timestamps: true });

delete mongoose.models.Product;
export default mongoose.model<IProduct>('Product', ProductSchema);
