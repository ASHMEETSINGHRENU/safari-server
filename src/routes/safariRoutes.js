import express from 'express';
import { 
  getSafaris, 
  getSafariBySlug, 
  createSafari, 
  updateSafari, 
  deleteSafari 
} from '../controllers/safariController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSafaris);
router.get('/:slug', getSafariBySlug);
router.post('/', authenticateToken, requireRole('super_admin', 'admin', 'booking_manager'), createSafari);
router.put('/:id', authenticateToken, requireRole('super_admin', 'admin', 'booking_manager'), updateSafari);
router.delete('/:id', authenticateToken, requireRole('super_admin', 'admin'), deleteSafari);

export default router;
