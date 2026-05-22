import client from './client';
import type { ApiResponse, Shop } from './types';

export async function getShops() {
  const res = await client.get<ApiResponse<Shop[]>>('/shops');
  return res.data;
}

export async function createShop(data: Omit<Shop, 'id'>) {
  const res = await client.post<ApiResponse>('/shops', data);
  return res.data;
}

export async function updateShop(id: number, data: Omit<Shop, 'id'>) {
  const res = await client.put<ApiResponse>(`/shops/${id}`, data);
  return res.data;
}

export async function deleteShop(id: number) {
  const res = await client.delete<ApiResponse>(`/shops/${id}`);
  return res.data;
}
