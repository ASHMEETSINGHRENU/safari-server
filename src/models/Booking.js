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
slot: { type: String, required: true },
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
    enum: ['pending', 'confirmed', 'payment_pending', 'paid', 'cancelled', 'completed', 'rejected'], 
    default: 'confirmed' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'paid' 
  }
}, { timestamps: true });

export const Booking = mongoose.model('Booking', BookingSchema);
