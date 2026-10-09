import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  bookingRef: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, default: 'India' },
    idType: { type: String, default: 'Aadhaar / Passport' },
    idNumber: { type: String }
  },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  destinationName: { type: String, required: true },
  safari: { type: mongoose.Schema.Types.ObjectId, ref: 'Safari' },
safariName: { type: String, required: true },
  safariDate: { type: String, required: true },
  // Slot selection was removed from the wizard; the rep assigns it during review.
  slot: { type: String, default: 'To be confirmed' },
  zone: { type: String, required: true },
  vehicleType: { type: String, default: 'Open 4x4 Safari Jeep' },
  guests: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },
  guestDetails: {
    type: [
      {
        fullName: { type: String, default: '' },
        idType: { type: String, default: 'Aadhaar Card' },
        idNumber: { type: String, default: '' }
      }
    ],
    default: []
  },
  naturalistRequested: { type: Boolean, default: true },
  specialRequests: { type: String },
  totalAmount: { type: Number, required: true },
  packageLabel: { type: String, enum: ['Budget', 'Mid-Range', 'Luxury'] },
  bookingStatus: { 
    type: String, 
    enum: ['pending', 'under_review', 'confirmed', 'alternative_suggested', 'payment_pending', 'paid', 'cancelled', 'completed', 'rejected'], 
    default: 'under_review' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  // Lead rep's counter-offer when the requested date/reserve is unavailable.
  suggestion: {
    destinationName: { type: String },
    destinationSlug: { type: String },
    packageLabel: { type: String },
    message: { type: String }
  }
}, { timestamps: true });

export const Booking = mongoose.model('Booking', BookingSchema);
