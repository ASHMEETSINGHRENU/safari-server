import mongoose from 'mongoose';

const SafariSchema = new mongoose.Schema({
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  destinationSlug: { type: String, required: true },
  destinationName: { type: String, required: true },
  state: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  safariType: { 
    type: String, 
    enum: ['Jeep Safari', 'Canter Safari', 'Private Photography Safari', 'Full-Day Safari', 'Night Buffer Safari', 'Walking Safari'], 
    default: 'Jeep Safari' 
  },
  slot: { 
    type: String, 
    enum: ['Morning', 'Afternoon', 'Full Day', 'Night'], 
    default: 'Morning' 
  },
  duration: { type: String, default: '3.5 - 4 hours' },
  vehicle: { type: String, default: 'Open 4x4 Safari Jeep' },
  capacity: { type: Number, default: 6 },
  zones: [{ type: String }],
  basePrice: { type: Number, required: true },
  permitFee: { type: Number, default: 1500 },
  guideFee: { type: Number, default: 1000 },
  description: { type: String },
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  highlights: [{ type: String }],
  availableDays: [{ type: String }],
  availabilityStatus: { 
    type: String, 
    enum: ['AVAILABLE', 'FAST FILLING', 'SOLD OUT'], 
    default: 'AVAILABLE' 
  },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export const Safari = mongoose.model('Safari', SafariSchema);
