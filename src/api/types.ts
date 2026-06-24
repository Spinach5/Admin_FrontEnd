export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

export interface User {
  id: number;
  account: string;
  schoolId: string;
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
  is_frozen: number;
}

export interface AffairCategory {
  id: number;
  name: string;
  created_at: string;
}

export interface Club {
  id: number;
  name: string;
  introduction: string;
  activities: string;
  category: string;
  image_url: string;
  schoolId: string;
  nature: number;
  contact: string;
  principal_id?: number;
  principal_name?: string;
}

export interface BookImage {
  id: number;
  book_id: number;
  url: string;
  sort_order: number;
}

export interface Book {
  id: number;
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

export interface BookCategory {
  id: number;
  name: string;
  school_id: string;
  sort_order: number;
  book_count: number;
}

export interface Conversation {
  id: number;
  conversation_id: number;
  book_id: number;
  book_title: string;
  buyer_id: number;
  buyer_nick: string;
  buyer_stu_id: string;
  seller_id: number;
  seller_nick: string;
  seller_stu_id: string;
  message_count: number;
  last_content: string;
  last_time: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

export interface ExcelPreview {
  headers: string[];
  rows: Record<string, string>[];
  total: number;
}
