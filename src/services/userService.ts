import type { User } from '../types/user';
import { BASE_URL } from './api';

export async function fetchAllUsers(token: string): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data.error as string) || 'Error al obtener usuarios');
  }

  return res.json();
}
