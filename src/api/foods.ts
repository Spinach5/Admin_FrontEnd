import client from './client';
import type { ApiResponse, Food } from './types';

export async function getFoods() {
  const res = await client.get<ApiResponse<Food[]>>('/foods');
  return res.data;
}

export async function createFood(data: Omit<Food, 'id'>) {
  const res = await client.post<ApiResponse>('/foods', data);
  return res.data;
}

export async function updateFood(id: number, data: Omit<Food, 'id'>) {
  const res = await client.put<ApiResponse>(`/foods/${id}`, data);
  return res.data;
}

export async function deleteFood(id: number) {
  const res = await client.delete<ApiResponse>(`/foods/${id}`);
  return res.data;
}
