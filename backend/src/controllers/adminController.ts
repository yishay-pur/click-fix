import { Request, Response } from 'express';
import User from '../models/User';
import Employee from '../models/Employee';
import Quote from '../models/Quote';
import Category from '../models/Category';
import Review from '../models/Review';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Get dashboard statistics
 * Returns counts for users, professionals, pending approvals, quotes, etc.
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Count total registered users (customers)
    const totalUsers = await User.count();

    // Count total professionals
    const totalProfessionals = await Employee.count();

    // Count professionals pending approval
    const pendingApprovals = await Employee.count({
      where: { status: 'pending' },
    });

    // Count open complaints (if you have a Complaint model)
    // For now, using placeholder
    const openComplaints = 0;

    // Count reviews that need attention (if you have logic for this)
    // For now, using placeholder
    const reviewsToCheck = 0;

    // Count quotes from this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const quotesThisMonth = await Quote.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // Calculate growth percentages (comparing to previous period)
    // For simplicity, returning placeholder values
    const stats = {
      totalUsers,
      totalProfessionals,
      pendingApprovals,
      openComplaints,
      reviewsToCheck,
      quotesThisMonth,
      growth: {
        users: 12, // placeholder
        professionals: 8, // placeholder
        quotes: 15, // placeholder
      },
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', (error as Error).message);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

/**
 * Get recent activity
 * Returns recent registrations, approvals, reviews, and complaints
 */
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const activities: any[] = [];

    // Get recent professional registrations (last 10)
    const recentProfessionals = await Employee.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'firstName', 'lastName', 'status', 'createdAt'],
    });

    // Add professional registrations to activities
    for (const prof of recentProfessionals) {
      if (prof.status === 'pending') {
        activities.push({
          id: `prof-${prof.id}`,
          type: 'registration',
          title: 'בעל מקצוע חדש נרשם',
          description: `${prof.firstName} ${prof.lastName}`,
          time: formatTimeAgo(prof.createdAt),
          createdAt: prof.createdAt,
        });
      } else if (prof.status === 'approved') {
        activities.push({
          id: `approval-${prof.id}`,
          type: 'approval',
          title: 'בעל מקצוע אושר',
          description: `${prof.firstName} ${prof.lastName}`,
          time: formatTimeAgo(prof.createdAt),
          createdAt: prof.createdAt,
        });
      }
    }

    // Get recent quotes
    const recentQuotes = await Quote.findAll({
      limit: 3,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'createdAt', 'guestName'],
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['firstName', 'lastName'],
        },
      ],
    });

    // Add quotes to activities
    for (const quote of recentQuotes) {
      const quoteWithCustomer = quote as any;
      const customerName =
        quote.guestName ||
        (quoteWithCustomer.customer
          ? `${quoteWithCustomer.customer.firstName} ${quoteWithCustomer.customer.lastName}`
          : 'לקוח');
      activities.push({
        id: `quote-${quote.id}`,
        type: 'registration',
        title: 'בקשת הצעת מחיר חדשה',
        description: `מאת ${customerName}`,
        time: formatTimeAgo(quote.createdAt),
        createdAt: quote.createdAt,
      });
    }

    // Sort all activities by creation date
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Return top 10 most recent
    res.status(200).json(activities.slice(0, 10));
  } catch (error) {
    console.error('Error fetching recent activity:', (error as Error).message);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
};

/**
 * Get pending professional approvals
 * Returns all employees with status='pending' along with their categories
 */
export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const pendingProfessionals = await Employee.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Transform to match frontend expected format
    const transformed = pendingProfessionals.map((prof: any) => ({
      id: prof.id.toString(),
      firstName: prof.firstName,
      lastName: prof.lastName,
      email: prof.email,
      phone: prof.phone,
      categoryId: prof.categories?.[0]?.id?.toString() || '',
      categoryName: prof.categories?.[0]?.name || '',
      description: prof.description || '',
      yearsOfExperience: prof.yearsOfExperience || 0,
      serviceAreas: prof.area ? prof.area.split(',').map((a: string) => a.trim()) : [],
      certificates: prof.certificates || [],
      createdAt: prof.createdAt,
    }));

    res.status(200).json(transformed);
  } catch (error) {
    console.error('Error fetching pending approvals:', (error as Error).message);
    res.status(500).json({ message: 'Error fetching pending approvals' });
  }
};

/**
 * Approve a professional
 * Updates status to 'approved' and sets approval timestamp
 */
export const approveProfessional = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    const professional = await Employee.findByPk(id);

    if (!professional) {
      res.status(404).json({ message: 'Professional not found' });
      return;
    }

    if (professional.status !== 'pending') {
      res.status(400).json({ message: 'Professional is not pending approval' });
      return;
    }

    await professional.update({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: adminId || null,
    });

    res.status(200).json({ message: 'Professional approved successfully', professional });
  } catch (error) {
    console.error('Error approving professional:', (error as Error).message);
    res.status(500).json({ message: 'Error approving professional' });
  }
};

/**
 * Reject a professional
 * Updates status to 'rejected'
 */
export const rejectProfessional = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ message: 'Rejection reason is required' });
      return;
    }

    const professional = await Employee.findByPk(id);

    if (!professional) {
      res.status(404).json({ message: 'Professional not found' });
      return;
    }

    if (professional.status !== 'pending') {
      res.status(400).json({ message: 'Professional is not pending approval' });
      return;
    }

    await professional.update({
      status: 'rejected',
    });

    res.status(200).json({ message: 'Professional rejected successfully' });
  } catch (error) {
    console.error('Error rejecting professional:', (error as Error).message);
    res.status(500).json({ message: 'Error rejecting professional' });
  }
};

/**
 * Get all users with quotes count
 * Returns all customer users with their quote statistics
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Quote,
          as: 'quotes',
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('quotes.id')), 'quotesCount'],
        ],
      },
      group: ['User.id'],
      order: [['createdAt', 'DESC']],
    });

    // Transform to match frontend expected format
    const transformed = users.map((user: any) => ({
      id: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: 'customer',
      status: 'active', // Default status
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastEntrance,
      quotesCount: parseInt(user.dataValues.quotesCount) || 0,
    }));

    res.status(200).json(transformed);
  } catch (error) {
    console.error('Error fetching users:', (error as Error).message);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

/**
 * Get all categories with professional counts
 * Returns categories enriched with the number of professionals in each
 */
export const getCategoriesWithCounts = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Employee,
          as: 'employees',
          attributes: [],
          through: { attributes: [] },
        },
      ],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('employees.id')), 'professionalsCount'],
        ],
      },
      group: ['Category.id'],
      order: [['id', 'ASC']],
    });

    // Transform to match frontend expected format
    const transformed = categories.map((cat: any) => ({
      id: cat.id.toString(),
      name: cat.name,
      icon: cat.image || '🔧',
      description: cat.description,
      isActive: true, // All categories are active by default
      professionalsCount: parseInt(cat.dataValues.professionalsCount) || 0,
      order: cat.id,
    }));

    res.status(200).json(transformed);
  } catch (error) {
    console.error('Error fetching categories with counts:', (error as Error).message);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

/**
 * Get all reviews with user and professional information
 * Returns all reviews for admin moderation
 */
export const getAllReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Transform to match frontend expected format
    const transformed = reviews.map((review: any) => {
      const priceRate = review.priceRate || 0;
      const serviceRate = review.serviceRate || 0;
      const performanceRate = review.performanceRate || 0;
      const overallRating = Math.round((priceRate + serviceRate + performanceRate) / 3);

      return {
        id: review.id.toString(),
        customerId: review.userId?.toString() || '',
        customerName: review.user
          ? `${review.user.firstName} ${review.user.lastName}`
          : 'משתמש לא ידוע',
        professionalId: review.employeeId?.toString() || '',
        professionalName: review.employee
          ? `${review.employee.firstName} ${review.employee.lastName}`
          : 'בעל מקצוע לא ידוע',
        overallRating,
        content: review.comment || '',
        status: 'approved', // All reviews are approved by default (no status field in model)
        createdAt: review.createdAt,
      };
    });

    res.status(200).json(transformed);
  } catch (error) {
    console.error('Error fetching reviews:', (error as Error).message);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

/**
 * Helper function to format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) return 'כרגע';
  if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
  if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
  return `לפני ${diffInDays} ימים`;
}
