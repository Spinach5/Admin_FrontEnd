import client from './client';
import type { ApiResponse, Book } from './types';

interface BookItem {
  book_id: number;
  title: string;
  category: string;
  image_url: string;
  price: string;
  isbn: string;
  contact: string;
  user_id: number;
  status: string;
  nickName: string;
  stuId: string;
}

function mapBook(b: BookItem): Book {
  return { ...b, id: b.book_id };
}

export async function getBooks() {
  const res = await client.get<ApiResponse<BookItem[]>>('/books');
  return { ...res.data, data: res.data.data?.map(mapBook) };
}

export async function getBook(id: number) {
  const res = await client.get<ApiResponse<BookItem>>(`/books/${id}`);
  return { ...res.data, data: res.data.data ? mapBook(res.data.data) : undefined };
}

export async function createBook(data: FormData) {
  const res = await client.post<ApiResponse>('/books', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateBook(id: number, data: FormData) {
  const res = await client.put<ApiResponse>(`/books/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteBook(id: number) {
  const res = await client.delete<ApiResponse>(`/books/${id}`);
  return res.data;
}

export async function getCategories() {
  const res = await client.get<ApiResponse<string[]>>('/books/categories');
  return res.data;
}
