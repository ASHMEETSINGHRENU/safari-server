import mongoose from 'mongoose';

const JournalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['Wildlife', 'Photography', 'Safari Guide', 'Destinations', 'Responsible Tourism'], 
    default: 'Wildlife' 
  },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, required: true },
  author: { type: String, default: 'Resident Naturalist' },
  readTime: { type: String, default: '5 min read' },
  destinationTag: { type: String },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Journal = mongoose.model('Journal', JournalSchema);
