import express from 'express';
import {
  getCMSContent,
  updateCMSContent,
  getGallery,
  createGalleryItem,
  getJournals,
  getJournalBySlug,
  createJournal,
  getFAQs,
  createFAQ,
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  subscribeNewsletter,
  getReviews,
  submitReview,
  getSiteSettings,
  updateSiteSettings
} from '../controllers/cmsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// CMS Content (Homepage, Our Story, About, etc.)
router.get('/content/:key', getCMSContent);
router.put('/content/:key', authenticateToken, requireRole('super_admin', 'admin', 'content_manager'), updateCMSContent);

// Gallery
router.get('/gallery', getGallery);
router.post('/gallery', authenticateToken, requireRole('super_admin', 'admin', 'content_manager'), createGalleryItem);

// Journal
router.get('/journal', getJournals);
router.get('/journals', getJournals);
router.get('/journal/:slug', getJournalBySlug);
router.get('/journals/:slug', getJournalBySlug);
router.post('/journal', authenticateToken, requireRole('super_admin', 'admin', 'content_manager'), createJournal);

// FAQ
router.get('/faqs', getFAQs);
router.post('/faqs', authenticateToken, requireRole('super_admin', 'admin'), createFAQ);

// Inquiries
router.post('/inquiries', submitInquiry);
router.get('/inquiries', authenticateToken, requireRole('super_admin', 'admin', 'booking_manager'), getInquiries);
router.put('/inquiries/:id/status', authenticateToken, requireRole('super_admin', 'admin', 'booking_manager'), updateInquiryStatus);

// Reviews
router.get('/reviews', getReviews);
router.post('/reviews', submitReview);

// Site Settings
router.get('/settings', getSiteSettings);
router.put('/settings', authenticateToken, requireRole('super_admin', 'admin'), updateSiteSettings);

// Newsletter
router.post('/newsletter', subscribeNewsletter);

export default router;
