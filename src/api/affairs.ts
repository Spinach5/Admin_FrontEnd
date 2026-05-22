import client from './client';
import type { ApiResponse, Affair } from './types';

export async function getAffairs() {
  const res = await client.get<ApiResponse<Affair[]>>('/affairs');
  return res.data;
}

export async function createAffair(data: Omit<Affair, 'id' | 'created_at'>) {
  const res = await client.post<ApiResponse>('/affairs', data);
  return res.data;
}

export async function updateAffair(id: number, data: Omit<Affair, 'id' | 'created_at'>) {
  const res = await client.put<ApiResponse>(`/affairs/${id}`, data);
  return res.data;
}

export async function deleteAffair(id: number) {
  const res = await client.delete<ApiResponse>(`/affairs/${id}`);
  return res.data;
}
