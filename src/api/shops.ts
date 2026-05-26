import client from './client';
import type { ApiResponse, Shop } from './types';

export async function getShops() {
  const res = await client.get<ApiResponse<Shop[]>>('/shops');//<ApiResponse<Shop[]>>泛型类型，Shop[]是Shop类型的数组
  return res.data;
}

export async function createShop(data: Omit<Shop, 'id'>) {
  const res = await client.post<ApiResponse<Shop>>('/shops', data);
  return res.data;
}

export async function updateShop(id: number, data: Omit<Shop, 'id'>) {
  const res = await client.put<ApiResponse<Shop>>(`/shops/${id}`, data);//<ApiResponse<Shop>>泛型类型，Shop是Shop类型的对象
  return res.data;
}

export async function deleteShop(id: number) {
  const res = await client.delete<ApiResponse<Shop>>(`/shops/${id}`);//<ApiResponse<Shop>>泛型类型，Shop是Shop类型的对象
  return res.data;
}
