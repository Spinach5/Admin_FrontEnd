import client from './client';
import type { ApiResponse, Club } from './types';

export async function getClubs() {
  const res = await client.get<ApiResponse<Club[]>>('/clubs');
  return res.data;
}

export async function createClub(data: Omit<Club, 'id'>) {
  const res = await client.post<ApiResponse>('/clubs', data);
  return res.data;
}

export async function updateClub(id: number, data: Omit<Club, 'id'>) {
  const res = await client.put<ApiResponse>(`/clubs/${id}`, data);
  return res.data;
}

export async function getClubCategories() {
  const res = await client.get<ApiResponse<string[]>>('/clubs/categories');
  return res.data;
}

export async function deleteClub(id: number) {
  const res = await client.delete<ApiResponse>(`/clubs/${id}`);
  return res.data;
}
