import express from 'express';
import { register, login, getMe, updateProfile, toggleSaveDestination } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/limiters.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/saved-destinations/:destinationId', authenticateToken, toggleSaveDestination);

export default router;
