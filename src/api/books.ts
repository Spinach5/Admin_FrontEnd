import client from './client';
import type { ApiResponse, Book } from './types';

interface BookItem {
  book_id: number;
  title: string;
  category: string;
  price: string;
  isbn: string;
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

export async function createBook(data: Omit<Book, 'id' | 'nickName' | 'stuId'>) {
  const res = await client.post<ApiResponse>('/books', data);
  return res.data;
}

export async function updateBook(id: number, data: Omit<Book, 'id' | 'nickName' | 'stuId'>) {
  const res = await client.put<ApiResponse>(`/books/${id}`, data);
  return res.data;
}

export async function deleteBook(id: number) {
  const res = await client.delete<ApiResponse>(`/books/${id}`);
  return res.data;
}
