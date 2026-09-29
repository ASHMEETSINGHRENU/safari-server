import mongoose from 'mongoose';

const DestinationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  state: { type: String, required: true, enum: ['Madhya Pradesh', 'Maharashtra'] },
  tagline: { type: String, required: true },
  shortDesc: { type: String, required: true },
  editorialQuote: { type: String },
  fullDesc: { type: String, required: true },
  heroImage: { type: String, required: true },
  galleryImages: [{ type: String }],
  areaSqKm: { type: Number, required: true },
  tigerCount: { type: String, required: true },
  bestTimeToVisit: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  mapPosition: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  startingPrice: { type: Number, required: true },
  availability: { 
    type: String, 
    enum: ['AVAILABLE', 'FEW PERMITS', 'LIMITED', 'SOLD OUT'], 
    default: 'AVAILABLE' 
  },
  zones: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['core', 'buffer'], required: true },
    gates: [{ type: String }],
    vehicleQuotaPerDay: { type: Number },
    description: { type: String },
    highlight: { type: String }
  }],
  wildlifeHighlights: [{ type: String }],
  howToReach: {
    air: { type: String },
    rail: { type: String },
    road: { type: String }
  },
  rulesAndGuidelines: [{ type: String }],
  faqs: [{
    question: { type: String },
    answer: { type: String }
  }],
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export const Destination = mongoose.model('Destination', DestinationSchema);
