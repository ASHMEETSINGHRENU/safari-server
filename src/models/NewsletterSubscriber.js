import mongoose from 'mongoose';

const NewsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now }
});

export const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
