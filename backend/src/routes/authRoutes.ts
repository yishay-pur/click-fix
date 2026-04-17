import { Router } from 'express';
import { login, register, getProfile, adminLogin } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/admin/login
router.post('/admin/login', adminLogin);

// GET /api/auth/profile (protected)
router.get('/profile', authMiddleware, getProfile);

export default router;
