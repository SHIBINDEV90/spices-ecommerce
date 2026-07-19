import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  vendorId: mongoose.Types.ObjectId;
  availableBalance: number;
  pendingBalance: number;
  withdrawnBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, unique: true },
  availableBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  withdrawnBalance: { type: Number, default: 0 },
}, { timestamps: true });

delete mongoose.models.Wallet;
export default mongoose.model<IWallet>('Wallet', WalletSchema);
