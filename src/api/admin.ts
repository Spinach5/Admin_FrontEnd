import client from './client';
import type { ApiResponse, User } from './types';

export async function getUsers() {
  const res = await client.get<ApiResponse<User[]>>('/admin/users');
  return res.data;
}

export async function createUser(data: { account: string; password: string; is_super: number }) {
  const res = await client.post<ApiResponse>('/admin/users', data);
  return res.data;
}

export async function updateUser(id: number, data: { account: string; password?: string; is_super: number; is_active: number }) {
  const res = await client.put<ApiResponse>(`/admin/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id: number) {
  const res = await client.delete<ApiResponse>(`/admin/users/${id}`);
  return res.data;
}
