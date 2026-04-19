import api from './api';
import type { Professional, ProfessionalStats } from '../types/professional.types';
import type { Review } from '../types/review.types';
import type { Gender } from '../types/user.types';
import type { QuoteRequest } from '../types/quote.types';

export interface SearchParams {
  query?: string;
  category?: string;
  city?: string;
  gender?: Gender;
  minRating?: number;
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

function mapEmployeeToProfessional(emp: any): Professional {
  const reviews = emp.reviews || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + ((r.serviceRate || 0) + (r.priceRate || 0) + (r.performanceRate || 0)) / 3, 0) / reviews.length
    : 0;
  const categories = emp.categories || [];

  return {
    ...emp,
    id: String(emp.id),
    categoryName: categories[0]?.name || '',
    categoryId: categories[0] ? String(categories[0].id) : '',
    serviceAreas: emp.area ? [emp.area] : [],
    reviewCount: reviews.length,
    rating: {
      overall: Math.round(avgRating * 10) / 10,
      reliability: 0,
      service: 0,
      availability: 0,
      price: 0,
      professionalism: 0,
    },
    isVerified: emp.status === 'approved',
    services: emp.services || [],
    workingHours: emp.workingHours || [],
    certificates: emp.certificates || [],
  };
}

export const professionalService = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await api.get('/employees', { params });
    const data = response.data;
    if (Array.isArray(data)) {
      const professionals = data.map(mapEmployeeToProfessional);
      return {
        professionals,
        total: professionals.length,
        page: 1,
        totalPages: 1,
      };
    }
    return data as SearchResponse;
  },

  getById: async (id: string): Promise<Professional> => {
    const response = await api.get(`/employees/${id}`);
    return mapEmployeeToProfessional(response.data);
  },

  getFeatured: async (limit = 4): Promise<Professional[]> => {
    const response = await api.get<any[]>('/employees');
    return (response.data || []).slice(0, limit).map(mapEmployeeToProfessional);
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
