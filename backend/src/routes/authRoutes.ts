import { Router } from 'express';
import { login, register, registerProfessional, getProfile } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/register-professional
router.post('/register-professional', registerProfessional);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile (protected)
router.get('/profile', authMiddleware, getProfile);

export default router;
