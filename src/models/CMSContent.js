import mongoose from 'mongoose';

const CMSContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const CMSContent = mongoose.model('CMSContent', CMSContentSchema);
