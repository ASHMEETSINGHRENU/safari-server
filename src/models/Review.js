import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  destinationName: { type: String, required: true },
  author: { type: String, required: true },
  authorLocation: { type: String, default: 'India' },
  rating: { type: Number, default: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  safariType: { type: String, default: 'Jeep Safari' },
  date: { type: String },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

export const Review = mongoose.model('Review', ReviewSchema);
