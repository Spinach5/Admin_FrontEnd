export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

export interface User {
  id: number;
  account: string;
  is_super: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResult {
  token: string;
  user: { id: number; account: string; is_super: number };
}

export interface Module {
  name: string;
  path: string;
  icon: string;
}

export interface Shop {
  id: number;
  name: string;
  canteen_name: string;
  rating: number;
  comment: string;
  min: number;
  max: number;
}

export interface Food {
  id: number;
  name: string;
  shop_name: string;
  canteen_name: string;
  price: number;
  taste: string;
  category: string;
}

export interface Affair {
  id: number;
  name: string;
  category: string;
  link: string;
  details: string;
  channel: string;
  created_at: string;
}

export interface NormalUser {
  id: number;
  stuId: string;
  nickName: string;
  schoolId: string;
  createdAt: string;
  isDeleted: number;
}

export interface AffairCategory {
  id: number;
  name: string;
  created_at: string;
}

export interface Book {
  id: number;
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

export interface ExcelPreview {
  headers: string[];
  rows: Record<string, string>[];
  total: number;
}
