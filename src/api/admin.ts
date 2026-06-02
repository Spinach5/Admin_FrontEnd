import client from './client';
import type { ApiResponse, User } from './types';

export async function getUsers() {
  const res = await client.get<ApiResponse<User[]>>('/admin/admins');
  return res.data;
}

export async function createUser(data: { account: string; password: string; is_super: number }) {
  const res = await client.post<ApiResponse>('/admin/admins', data);
  return res.data;
}

export async function updateUser(id: number, data: { account: string; password?: string; is_super: number; is_active: number }) {
  const res = await client.put<ApiResponse>(`/admin/admins/${id}`, data);
  return res.data;
}

export async function deleteUser(id: number) {
  const res = await client.delete<ApiResponse>(`/admin/admins/${id}`);
  return res.data;
}
