export type UserRole = 'guest' | 'customer' | 'professional' | 'admin';
export type Gender = 'male' | 'female' | 'other';
export type UserStatus = 'active' | 'pending' | 'blocked';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender?: Gender;
  city?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  isAdmin?: boolean;
  isManager?: boolean;
}

export interface CustomerUser extends User {
  role: 'customer';
  favorites: string[]; // professional IDs
}

export interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
