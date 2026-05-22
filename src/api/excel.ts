import client from './client';
import type { ApiResponse, ExcelPreview } from './types';

export async function previewExcel(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await client.post<ApiResponse<ExcelPreview>>('/excel/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function importExcel(table: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await client.post<ApiResponse>(`/excel/import?table=${table}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
