import api from './api';
import type { Category } from '../types/category.types';
import { mockService } from './mock.service';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    try {
      // Try to get categories from server first
      const response = await api.get<Category[]>('/categories');
      return response.data;
    } catch (error) {
      // If server is unavailable, fallback to mock data
      console.warn('Server unavailable, using mock data for categories');
      return await mockService.getCategories();
    }
  },

  getById: async (id: string): Promise<Category> => {
    try {
      const response = await api.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      // If server is unavailable, try to get from mock data
      console.warn('Server unavailable, using mock data for category details');
      const categories = await mockService.getCategories();
      const category = categories.find(c => c.id === id);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    }
  }
};