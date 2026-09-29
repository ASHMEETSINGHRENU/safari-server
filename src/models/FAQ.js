import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({
  category: { 
    type: String, 
    enum: ['Booking', 'Safari', 'Destinations', 'Payments', 'Preparation', 'Wildlife Etiquette'], 
    default: 'Booking' 
  },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export const FAQ = mongoose.model('FAQ', FAQSchema);
