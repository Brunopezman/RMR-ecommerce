/** Usuario del sistema */
export interface User {
  id: number | string;
  email: string;
  name: string;
  address?: string;
  createdAt?: string;
}
