import type { Professional } from '../types/professional.types';
import type { Category } from '../types/category.types';
import type { User } from '../types/user.types';

interface MockData {
  categories: Category[];
  professionals: Professional[];
  customers: User[];
}

let mockData: MockData | null = null;

export const mockService = {
  async loadMockData(): Promise<MockData> {
    if (mockData) return mockData;

    try {
      const response = await fetch('/mock-data.json');
      if (!response.ok) {
        throw new Error('Failed to load mock data');
      }
      mockData = await response.json();
      return mockData!;
    } catch (error) {
      console.error('Error loading mock data:', error);
      throw error;
    }
  },

  async getCategories(): Promise<Category[]> {
    const data = await this.loadMockData();
    return data.categories;
  },

  async getProfessionals(): Promise<Professional[]> {
    const data = await this.loadMockData();
    return data.professionals;
  },

  async getCustomers(): Promise<User[]> {
    const data = await this.loadMockData();
    return data.customers;
  },

  async searchProfessionals(params: {
    query?: string;
    category?: string;
    city?: string;
    gender?: string;
    minRating?: string | number;
  }): Promise<{ professionals: Professional[]; total: number; page: number; totalPages: number }> {
    const professionals = await this.getProfessionals();

    let filtered = professionals.filter(p => {
      if (params.category && p.categoryId !== params.category) return false;
      if (params.city && p.city !== params.city) return false;
      if (params.gender && p.gender !== params.gender) return false;
      if (params.minRating) {
        const minRatingNum = typeof params.minRating === 'string' ? parseInt(params.minRating) : params.minRating;
        if (p.rating.overall < minRatingNum) return false;
      }
      if (params.query) {
        const searchLower = params.query.toLowerCase();
        const matches =
          (p.firstName || '').toLowerCase().includes(searchLower) ||
          (p.lastName || '').toLowerCase().includes(searchLower) ||
          (p.description || '').toLowerCase().includes(searchLower) ||
          (p.categoryName || '').toLowerCase().includes(searchLower);
        if (!matches) return false;
      }
      return true;
    });

    return {
      professionals: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1,
    };
  },
};