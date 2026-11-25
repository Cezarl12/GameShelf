import { Router } from 'express';
import {
  deleteAccount,
  getProfile,
  getProfileStats,
  updateProfile,
} from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema } from '../utils/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', getProfile);
router.patch('/', validateBody(updateProfileSchema), updateProfile);
router.get('/stats', getProfileStats);
router.delete('/', deleteAccount);

export default router;
