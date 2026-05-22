import client from './client';
import type { ApiResponse, AffairCategory } from './types';

export async function getAffairCategories() {
  const res = await client.get<ApiResponse<AffairCategory[]>>('/affair-categories');
  return res.data;
}

export async function createAffairCategory(data: { name: string }) {
  const res = await client.post<ApiResponse>('/affair-categories', data);
  return res.data;
}

export async function updateAffairCategory(id: number, data: { name: string }) {
  const res = await client.put<ApiResponse>(`/affair-categories/${id}`, data);
  return res.data;
}

export async function deleteAffairCategory(id: number) {
  const res = await client.delete<ApiResponse>(`/affair-categories/${id}`);
  return res.data;
}
