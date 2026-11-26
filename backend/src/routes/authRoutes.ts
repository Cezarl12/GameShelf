import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../utils/validation';

const router = Router();

router.use(authRateLimiter);

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

export default router;
