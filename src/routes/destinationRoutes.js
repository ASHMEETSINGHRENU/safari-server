import express from 'express';
import { 
  getDestinations, 
  getDestinationBySlug, 
  createDestination, 
  updateDestination, 
  deleteDestination 
} from '../controllers/destinationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDestinations);
router.get('/:slug', getDestinationBySlug);
router.post('/', authenticateToken, requireRole('super_admin', 'admin', 'content_manager'), createDestination);
router.put('/:id', authenticateToken, requireRole('super_admin', 'admin', 'content_manager'), updateDestination);
router.delete('/:id', authenticateToken, requireRole('super_admin', 'admin'), deleteDestination);

export default router;
