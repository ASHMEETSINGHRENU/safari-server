import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Shutter and Stripes' },
  tagline: { type: String, default: 'Guided by Locals • Inspired by Nature' },
  contactEmail: { type: String, default: 'enquiries@shutterandstripessafaris.com' },
  contactPhone: { type: String, default: '+91 90219 18758' },
  officeAddress: { type: String, default: '392, At Moharli, Near Moharli Gate Core, Tadoba Road, Tadoba, Chandrapur, Maharashtra – 442404, India' },
  emergencySupport: { type: String, default: '+91 98230 45678' },
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/shutterandstripes' },
    facebook: { type: String, default: 'https://facebook.com/shutterandstripes' },
    youtube: { type: String, default: 'https://youtube.com/shutterandstripes' }
  }
}, { timestamps: true });

export const SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema);
