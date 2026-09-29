import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  destination: { type: String },
  preferredDates: { type: String },
  guests: { type: Number, default: 2 },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'contacted', 'resolved'], default: 'new' }
}, { timestamps: true });

export const Inquiry = mongoose.model('Inquiry', InquirySchema);
