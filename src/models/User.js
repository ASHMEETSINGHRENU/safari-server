import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'admin', 'booking_manager', 'customer'], 
    default: 'customer' 
  },
  phone: { type: String, trim: true },
  country: { type: String, default: 'India' },
  savedDestinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
