/** Usuario del sistema */
export interface User {
  id: number | string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
  apellido?: string;
  address?: string;
  codigoPostal?: string;
  sexo?: string;
  telefono?: string;
  createdAt?: string;
}
