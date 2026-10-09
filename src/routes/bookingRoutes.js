import express from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getBookingByRef, 
  cancelBooking, 
  getAllBookings, 
  updateBookingStatus,
  trackBooking
} from '../controllers/bookingController.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';
import { writeLimiter, lookupLimiter } from '../middleware/limiters.js';

const router = express.Router();

const LEAD_ROLES = ['super_admin', 'booking_manager'];

router.post('/', optionalAuth, writeLimiter, createBooking);
router.post('/track', lookupLimiter, trackBooking);
router.get('/my-bookings', authenticateToken, getMyBookings);
router.get('/ref/:ref', authenticateToken, getBookingByRef);
router.put('/:id/cancel', authenticateToken, cancelBooking);
router.get('/admin/all', authenticateToken, requireRole(...LEAD_ROLES), getAllBookings);
router.put('/admin/:id/status', authenticateToken, requireRole(...LEAD_ROLES), updateBookingStatus);

export default router;
