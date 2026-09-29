import { CMSContent } from '../models/CMSContent.js';
import { Gallery } from '../models/Gallery.js';
import { Journal } from '../models/Journal.js';
import { FAQ } from '../models/FAQ.js';
import { Inquiry } from '../models/Inquiry.js';
import { Review } from '../models/Review.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber.js';

// CMS Content
export const getCMSContent = async (req, res, next) => {
  try {
    const { key } = req.params;
    const content = await CMSContent.findOne({ key });
    res.json({ success: true, content: content ? content.data : null });
  } catch (error) {
    next(error);
  }
};

export const updateCMSContent = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { data } = req.body;
    const content = await CMSContent.findOneAndUpdate(
      { key },
      { key, data },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Content updated successfully.', content: content.data });
  } catch (error) {
    next(error);
  }
};

// Gallery
export const getGallery = async (req, res, next) => {
  try {
    const { animal, isFeatured } = req.query;
    let query = {};
    if (animal && animal !== 'All') query.animal = animal;
    if (isFeatured) query.isFeatured = isFeatured === 'true';

    const gallery = await Gallery.find(query).sort({ isFeatured: -1, createdAt: -1 });
    res.json({ success: true, count: gallery.length, gallery });
  } catch (error) {
    next(error);
  }
};

export const createGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// Journal
export const getJournals = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = { isPublished: true };
    if (category && category !== 'All') query.category = category;

    const journals = await Journal.find(query).sort({ publishedAt: -1 });
    res.json({ success: true, count: journals.length, journals });
  } catch (error) {
    next(error);
  }
};

export const getJournalBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const journal = await Journal.findOne({ slug });
    if (!journal) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, journal });
  } catch (error) {
    next(error);
  }
};

export const createJournal = async (req, res, next) => {
  try {
    const journal = await Journal.create(req.body);
    res.status(201).json({ success: true, journal });
  } catch (error) {
    next(error);
  }
};

// FAQ
export const getFAQs = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;

    const faqs = await FAQ.find(query).sort({ order: 1 });
    res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    next(error);
  }
};

export const createFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, faq });
  } catch (error) {
    next(error);
  }
};

// Inquiries
export const submitInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    res.status(201).json({ success: true, message: 'Inquiry received. A specialist will reach out shortly.', inquiry });
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    res.json({ success: true, inquiry });
  } catch (error) {
    next(error);
  }
};

// Reviews
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ rating: -1, createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req, res, next) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, message: 'Thank you for your review!', review });
  } catch (error) {
    next(error);
  }
};

// Site Settings
export const getSiteSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateSiteSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, message: 'Site settings updated.', settings });
  } catch (error) {
    next(error);
  }
};

// Newsletter
export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed to the wildlife gazette.' });
    }

    await NewsletterSubscriber.create({ email: email.toLowerCase().trim() });
    res.status(201).json({ success: true, message: 'Subscribed to Shutter and Stripes Wildlife Gazette.' });
  } catch (error) {
    next(error);
  }
};
