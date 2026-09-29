import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Shutter and Stripes' },
  tagline: { type: String, default: 'Guided by Locals • Inspired by Nature' },
  contactEmail: { type: String, default: 'concierge@shutterandstripes.com' },
  contactPhone: { type: String, default: '+91 (0) 712 258 4930' },
  officeAddress: { type: String, default: 'Civil Lines, Nagpur, Maharashtra 440001 (Gateway to Central Indian Tiger Reserves)' },
  emergencySupport: { type: String, default: '+91 98230 45678' },
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/shutterandstripes' },
    facebook: { type: String, default: 'https://facebook.com/shutterandstripes' },
    youtube: { type: String, default: 'https://youtube.com/shutterandstripes' }
  }
}, { timestamps: true });

export const SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema);
