import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  vendorId: mongoose.Types.ObjectId;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  bankDetails: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  bankDetails: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true });

delete mongoose.models.Withdrawal;
export default mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
