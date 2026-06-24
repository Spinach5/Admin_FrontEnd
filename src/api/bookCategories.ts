import client from './client';
import type { ApiResponse, BookCategory } from './types';

export async function getBookCategories(schoolId = 'hbut') {
  const res = await client.get<ApiResponse<BookCategory[]>>('/books/categories/detail', {
    params: { school_id: schoolId },
  });
  return res.data;
}

export async function createBookCategory(data: { name: string; sort_order?: number }) {
  const res = await client.post<ApiResponse>('/books/categories', {
    name: data.name,
    school_id: 'hbut',
    sort_order: data.sort_order ?? 0,
  });
  return res.data;
}

export async function updateBookCategory(id: number, data: { name: string; sort_order?: number }) {
  const res = await client.put<ApiResponse>(`/books/categories/${id}`, {
    name: data.name,
    sort_order: data.sort_order ?? 0,
  });
  return res.data;
}

export async function deleteBookCategory(id: number) {
  const res = await client.delete<ApiResponse>(`/books/categories/${id}`);
  return res.data;
}
