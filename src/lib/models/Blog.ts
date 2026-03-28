import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  author: string;
  content: string; // Markdown / HTML raw
  coverImage?: string;
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  author: { type: String, required: true, default: 'Admin' },
  content: { type: String, required: true },
  coverImage: { type: String },
  tags: { type: [String], default: [] },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

delete mongoose.models.Blog;
export default mongoose.model<IBlog>('Blog', BlogSchema);
