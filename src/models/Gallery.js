import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  animal: { 
    type: String, 
    enum: ['Tiger', 'Leopard', 'Elephant', 'Birds', 'Safari Life', 'Forest Landscape'], 
    default: 'Tiger' 
  },
  destinationName: { type: String },
  state: { type: String },
  photographer: { type: String, default: 'Shutter and Stripes Naturalists' },
  cameraGear: { type: String },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export const Gallery = mongoose.model('Gallery', GallerySchema);
