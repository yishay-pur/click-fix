import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// All admin routes require authentication
// In production, you should also check for admin role

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', authMiddleware, adminController.getDashboardStats);

// GET /api/admin/activity - Get recent activity
router.get('/activity', authMiddleware, adminController.getRecentActivity);

// GET /api/admin/approvals - Get pending professional approvals
router.get('/approvals', authMiddleware, adminController.getPendingApprovals);

// POST /api/admin/approvals/:id/approve - Approve a professional
router.post('/approvals/:id/approve', authMiddleware, adminController.approveProfessional);

// POST /api/admin/approvals/:id/reject - Reject a professional
router.post('/approvals/:id/reject', authMiddleware, adminController.rejectProfessional);

// GET /api/admin/categories - Get all categories with professional counts
router.get('/categories', authMiddleware, adminController.getCategoriesWithCounts);

// GET /api/admin/users - Get all users with quotes count
router.get('/users', authMiddleware, adminController.getAllUsers);

// GET /api/admin/reviews - Get all reviews
router.get('/reviews', authMiddleware, adminController.getAllReviews);

router.get('/managers', authMiddleware, adminController.getAllManagers);

router.post('/managers', authMiddleware, adminController.createManager);

router.delete('/managers/:id', authMiddleware, adminController.deleteManager);

export default router;
