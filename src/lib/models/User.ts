import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  otp?: string;
  otpExpiry?: Date;
  role: 'Admin' | 'Customer' | 'Vendor' | 'Delivery';
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, select: false }, // Only grabbed when explicitly asked
  otp: { type: String, select: false }, // Store OTP temporarily
  otpExpiry: { type: Date, select: false },
  role: { type: String, enum: ['Admin', 'Customer', 'Vendor', 'Delivery'], default: 'Customer' },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date }
}, { timestamps: true });

delete mongoose.models.User;
export default mongoose.model<IUser>('User', UserSchema);
