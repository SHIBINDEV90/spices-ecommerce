import mongoose, { Document, Schema, model, models } from 'mongoose';

export interface INotification extends Document {
  recipientRole: 'Admin' | 'Vendor';
  type: 'enquiry' | 'order' | 'system';
  title: string;
  message: string;
  link: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientRole: {
      type: String,
      enum: ['Admin', 'Vendor'],
      default: 'Admin',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['enquiry', 'order', 'system'],
      default: 'enquiry',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '/admin/enquiries',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const Notification = models.Notification || model<INotification>('Notification', NotificationSchema);

export default Notification;
