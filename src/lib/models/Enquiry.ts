import { Document, Schema, model, models } from 'mongoose';
import { IProduct } from '@/lib/models/Product';

export interface IEnquiry extends Document {
  product: Schema.Types.ObjectId | IProduct;
  name: string;
  email: string;
  country: string;
  company?: string;
  quantity: string;
  grade?: string;
  packaging?: string;
  message: string;
  status: 'pending' | 'reviewed' | 'closed';
  createdAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String, required: true },
    company: { type: String },
    quantity: { type: String, required: true },
    grade: { type: String },
    packaging: { type: String },
    message: { type: String, required: true },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

const Enquiry = models.Enquiry || model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;
