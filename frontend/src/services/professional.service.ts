import api from './api';
import type { Professional, ProfessionalStats } from '../types/professional.types';
import type { Review } from '../types/review.types';
import type { Gender } from '../types/user.types';
import type { QuoteRequest } from '../types/quote.types';
import { mockService } from './mock.service';

export interface SearchParams {
  query?: string;
  category?: string;
  city?: string;
  gender?: Gender;
  minRating?: number;
  shomerShabbat?: boolean;
  sortBy?: 'rating' | 'reviews' | 'price';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  professionals: Professional[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProfessionalReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}

export const professionalService = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    try {
      // Try to get data from server first
      const response = await api.get<SearchResponse>('/employees/search', { params });
      return response.data;
    } catch (error) {
      // If server is unavailable, fallback to mock data
      console.warn('Server unavailable, using mock data for search');
      return await mockService.searchProfessionals(params);
    }
  },

  getById: async (id: string): Promise<Professional> => {
    try {
      const response = await api.get<Professional>(`/employees/${id}`);
      return response.data;
    } catch (error) {
      // If server is unavailable, try to get from mock data
      console.warn('Server unavailable, using mock data for professional details');
      const professionals = await mockService.getProfessionals();
      const professional = professionals.find(p => p.id === id);
      if (!professional) {
        throw new Error('Professional not found');
      }
      return professional;
    }
  },

  getFeatured: async (limit = 4): Promise<Professional[]> => {
    try {
      // Try to get featured professionals from server
      const response = await api.get<Professional[]>('/employees/featured', { params: { limit } });
      return response.data;
    } catch (error) {
      // If server is unavailable, fallback to mock data
      console.warn('Server unavailable, using mock data for featured professionals');
      const professionals = await mockService.getProfessionals();
      return professionals.slice(0, limit);
    }
  },

  getReviews: async (
    professionalId: string,
    page = 1,
    limit = 10
  ): Promise<ProfessionalReviewsResponse> => {
    const response = await api.get<ProfessionalReviewsResponse>(
      `/employees/${professionalId}/reviews`,
      { params: { page, limit } }
    );
    return response.data;
  },

  getStats: async (professionalId: string): Promise<ProfessionalStats> => {
    const response = await api.get<ProfessionalStats>(
      `/employees/${professionalId}/stats`
    );
    return response.data;
  },

  getRecentRequests: async (professionalId: string, limit = 5): Promise<QuoteRequest[]> => {
    const response = await api.get<QuoteRequest[]>(
      `/employees/${professionalId}/recent-requests`,
      { params: { limit } }
    );
    return response.data;
  },

  updateProfile: async (
    professionalId: string,
    data: Partial<Professional>
  ): Promise<Professional> => {
    const response = await api.put<Professional>(
      `/employees/${professionalId}`,
      data
    );
    return response.data;
  },

  uploadCertificate: async (
    professionalId: string,
    file: File,
    name: string
  ): Promise<{ id: string; fileUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    const response = await api.post<{ id: string; fileUrl: string }>(
      `/employees/${professionalId}/certificates`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  deleteCertificate: async (
    professionalId: string,
    certificateId: string
  ): Promise<void> => {
    await api.delete(`/employees/${professionalId}/certificates/${certificateId}`);
  },
};

export default professionalService;
