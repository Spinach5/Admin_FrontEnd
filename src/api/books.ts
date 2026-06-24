import client from './client';
import type { ApiResponse, Book, BookImage } from './types';

interface BookItem {
  book_id: number;
  title: string;
  author: string;
  publisher: string;
  category: string;
  image_url: string;
  cover_url: string;
  price: string;
  isbn: string;
  contact: string;
  description: string;
  condition: string;
  user_id: number;
  status: string;
  school_id: string;
  is_delivery: number;
  book_type: number;
  create_time: string;
  nickName: string;
  stuId: string;
  images: BookImage[];
  want_count: number;
  is_wanted: boolean;
}

function mapBook(b: BookItem): Book {
  return {
    id: b.book_id,
    title: b.title,
    author: b.author || '',
    publisher: b.publisher || '',
    category: b.category,
    image_url: b.image_url,
    cover_url: b.cover_url || '',
    price: b.price,
    isbn: b.isbn,
    contact: b.contact,
    description: b.description,
    condition: b.condition,
    user_id: b.user_id,
    status: b.status,
    school_id: b.school_id,
    is_delivery: b.is_delivery,
    book_type: b.book_type,
    create_time: b.create_time,
    nickName: b.nickName,
    stuId: b.stuId,
    images: b.images || [],
    want_count: b.want_count || 0,
    is_wanted: b.is_wanted || false,
  };
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
