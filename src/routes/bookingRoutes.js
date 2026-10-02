import express from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getBookingByRef, 
  cancelBooking, 
  getAllBookings, 
  updateBookingStatus 
} from '../controllers/bookingController.js';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/limiters.js';

const router = express.Router();

router.post('/', optionalAuth, writeLimiter, createBooking);
router.get('/my-bookings', authenticateToken, getMyBookings);
router.get('/ref/:ref', authenticateToken, getBookingByRef);
router.put('/:id/cancel', authenticateToken, cancelBooking);
router.get('/admin/all', authenticateToken, requireRole('super_admin', 'admin', 'booking_manager'), getAllBookings);
router.put('/admin/:id/status', authenticateToken, requireRole('super_admin', 'admin', 'booking_manager'), updateBookingStatus);

export default router;
