import api from './api';

export interface DashboardStats {
  totalUsers: number;
  totalProfessionals: number;
  pendingApprovals: number;
  openComplaints: number;
  reviewsToCheck: number;
  quotesThisMonth: number;
  growth: {
    users: number;
    professionals: number;
    quotes: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'registration' | 'review' | 'complaint' | 'approval';
  title: string;
  description: string;
  time: string;
}

export interface PendingProfessional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  categoryId: string;
  categoryName: string;
  description: string;
  yearsOfExperience: number;
  serviceAreas: string[];
  certificates: Array<{ name: string; url: string }>;
  createdAt: Date;
}

export interface AdminCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
  professionalsCount: number;
  order: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  quotesCount: number;
}

export interface AdminReview {
  id: string;
  customerId: string;
  customerName: string;
  professionalId: string;
  professionalName: string;
  overallRating: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: Date;
  flagReason?: string;
}

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  isAdmin: boolean;
  isManager: boolean;
  createdAt: Date;
  lastEntrance?: Date;
}

export const adminService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/admin/stats');
    return response.data;
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (): Promise<RecentActivity[]> => {
    const response = await api.get<RecentActivity[]>('/admin/activity');
    return response.data;
  },

  /**
   * Get pending professional approvals
   */
  getPendingApprovals: async (): Promise<PendingProfessional[]> => {
    const response = await api.get<PendingProfessional[]>('/admin/approvals');
    return response.data;
  },

  /**
   * Approve a professional
   */
  approveProfessional: async (id: string): Promise<void> => {
    await api.post(`/admin/approvals/${id}/approve`);
  },

  /**
   * Reject a professional
   */
  rejectProfessional: async (id: string, reason: string): Promise<void> => {
    await api.post(`/admin/approvals/${id}/reject`, { reason });
  },

  /**
   * Get all categories with professional counts
   */
  getCategories: async (): Promise<AdminCategory[]> => {
    const response = await api.get<AdminCategory[]>('/admin/categories');
    return response.data;
  },

  /**
   * Create a new category
   */
  createCategory: async (data: { name: string; icon: string; description: string }): Promise<void> => {
    await api.post('/categories', {
      name: data.name,
      image: data.icon,
      description: data.description,
    });
  },

  /**
   * Update a category
   */
  updateCategory: async (id: string, data: { name: string; icon: string; description: string }): Promise<void> => {
    await api.put(`/categories/${id}`, {
      name: data.name,
      image: data.icon,
      description: data.description,
    });
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  /**
   * Get all users with quotes count
   */
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>('/admin/users');
    return response.data;
  },

  /**
   * Get all reviews
   */
  getReviews: async (): Promise<AdminReview[]> => {
    const response = await api.get<AdminReview[]>('/admin/reviews');
    return response.data;
  },

  /**
   * Get all managers
   */
  getAllManagers: async (): Promise<Manager[]> => {
    const response = await api.get<Manager[]>('/admin/managers');
    return response.data;
  },

  /**
   * Create a new manager
   */
  createManager: async (data: { firstName: string; lastName: string; email: string; password: string }): Promise<Manager> => {
    const response = await api.post<Manager>('/admin/managers', data);
    return response.data;
  },

  /**
   * Delete a manager
   */
  deleteManager: async (id: string): Promise<void> => {
    await api.delete(`/admin/managers/${id}`);
  },
};

export default adminService;
