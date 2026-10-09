import express from 'express';
import { getDashboardStats, getUsers, createUser, updateUserRole } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireRole('super_admin', 'booking_manager', 'content_manager'));

router.get('/stats', getDashboardStats);
router.get('/users', requireRole('super_admin'), getUsers);
router.post('/users', requireRole('super_admin'), createUser);
router.put('/users/:id/role', requireRole('super_admin'), updateUserRole);

export default router;
