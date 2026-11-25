import { Router } from 'express';
import authRoutes from './authRoutes';
import gamesRoutes from './gamesRoutes';
import healthRoutes from './healthRoutes';
import libraryRoutes from './libraryRoutes';
import profileRoutes from './profileRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/games', gamesRoutes);
router.use('/library', libraryRoutes);
router.use('/me', profileRoutes);

export default router;
