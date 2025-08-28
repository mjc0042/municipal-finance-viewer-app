export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  organization?: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  organization?: string;
  subscriptionTier?: string;
  credits?: number;
}