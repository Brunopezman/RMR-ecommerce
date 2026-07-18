export interface AuthUser {
  id: number | string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
  apellido?: string;
  address?: string;
  codigoPostal?: string;
  sexo?: string;
  telefono?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}
