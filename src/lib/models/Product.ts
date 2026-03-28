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
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  productType: { type: String, required: true, default: 'Spice' },
  stock: { type: Number, required: true, default: 0 },
  isBulkAvailable: { type: Boolean, default: false },
}, { timestamps: true });

delete mongoose.models.Product;
export default mongoose.model<IProduct>('Product', ProductSchema);
