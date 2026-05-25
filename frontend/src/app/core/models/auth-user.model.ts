export type UserRole = 'admin' | 'usuario';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  birthDate: string;
  department: string;
  city: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  birthDate: string;
  department: string;
  city: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
