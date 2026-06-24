import client from './client';
import type { ApiResponse, NormalUser } from './types';

export async function getUsers() {
  const res = await client.get<ApiResponse<NormalUser[]>>('/users');
  return res.data;
}

export async function getUser(id: number) {
  const res = await client.get<ApiResponse<NormalUser>>(`/users/${id}`);
  return res.data;
}

export async function createUser(data: { stuId: string; nickName: string; schoolId: string }) {
  const res = await client.post<ApiResponse>('/users', data);
  return res.data;
}

export async function updateUser(id: number, data: { stuId: string; nickName: string; schoolId: string }) {
  const res = await client.put<ApiResponse>(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id: number) {
  const res = await client.delete<ApiResponse>(`/users/${id}`);
  return res.data;
}

export async function hardDeleteUser(id: number) {
  const res = await client.delete<ApiResponse>(`/users/${id}/hard`);
  return res.data;
}

export async function freezeUser(id: number, frozen: boolean) {
  const res = await client.put<ApiResponse>(`/users/${id}/freeze`, { frozen });
  return res.data;
}
