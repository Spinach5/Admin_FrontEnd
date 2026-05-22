import client from './client';
import type { ApiResponse, LoginResult, User } from './types';

export async function login(account: string, password: string) {
  const res = await client.post<ApiResponse<LoginResult>>('/auth/login', { account, password });
  return res.data;
}

export async function logout() {
  const res = await client.post<ApiResponse>('/auth/logout');
  return res.data;
}

export async function getMe() {
  const res = await client.get<ApiResponse<User>>('/auth/me');
  return res.data;
}

export async function changePassword(old_password: string, new_password: string) {
  const res = await client.put<ApiResponse>('/auth/change-password', { old_password, new_password });
  return res.data;
}

export async function getModules() {
  const res = await client.get<ApiResponse<{ name: string; path: string; icon: string }[]>>('/modules');
  return res.data;
}
