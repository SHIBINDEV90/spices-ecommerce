import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Customer';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false }, // Only grabbed when explicitly asked
  role: { type: String, enum: ['Admin', 'Customer'], default: 'Customer' },
}, { timestamps: true });

delete mongoose.models.User;
export default mongoose.model<IUser>('User', UserSchema);
