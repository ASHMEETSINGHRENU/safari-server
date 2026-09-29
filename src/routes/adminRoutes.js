import express from 'express';
import { getDashboardStats, getUsers, updateUserRole } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireRole('super_admin', 'admin', 'booking_manager', 'content_manager'));

router.get('/stats', getDashboardStats);
router.get('/users', requireRole('super_admin', 'admin'), getUsers);
router.put('/users/:id/role', requireRole('super_admin', 'admin'), updateUserRole);

export default router;
