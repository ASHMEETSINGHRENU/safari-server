import express from 'express';
import { register, login, getMe, updateProfile, toggleSaveDestination } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/saved-destinations/:destinationId', authenticateToken, toggleSaveDestination);

export default router;
