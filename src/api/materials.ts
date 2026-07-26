import client from './client';
import type { ApiResponse, Material, MaterialClass, NullString, NullFloat64, ExcelPreview } from './types';

// 后端原始教材数据结构（sql.Null* 序列化为 {String, Valid} 等对象）
interface RawMaterial {
  book_id: number;
  isbn: string;
  title: string;
  author: NullString | string;
  publisher: NullString | string;
  price: NullFloat64 | number;
  created_at: NullString | string;
  extra_info: NullString | string;
}

interface RawMaterialWithClasses extends RawMaterial {
  semester?: string;
  classes?: string[];
}

function nullStr(v: NullString | string | undefined | null): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return v.Valid ? v.String : '';
}

function nullNum(v: NullFloat64 | number | undefined | null): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  return v.Valid ? v.Float64 : 0;
}

function mapMaterial(r: RawMaterial): Material {
  return {
    id: r.book_id,
    isbn: r.isbn,
    title: r.title,
    author: nullStr(r.author),
    publisher: nullStr(r.publisher),
    price: nullNum(r.price),
    created_at: nullStr(r.created_at),
    extra_info: nullStr(r.extra_info),
  };
}

function mapMaterialWithClasses(r: RawMaterialWithClasses): Material {
  return {
    ...mapMaterial(r),
    semester: r.semester,
    classes: r.classes || [],
  };
}

export interface MaterialQueryParams {
  semester?: string;
  class_name?: string;
  keyword?: string;
}

// 查询教材列表（支持学期/班级/关键字筛选）
export async function getMaterials(params?: MaterialQueryParams) {
  const res = await client.get<ApiResponse<RawMaterialWithClasses[] | RawMaterial[]>>('/materials', {
    params,
  });
  const data = res.data.data || [];
  // 含 classes 字段的为按学期查询结果
  return {
    ...res.data,
    data: data.map((d) =>
      'classes' in d ? mapMaterialWithClasses(d as RawMaterialWithClasses) : mapMaterial(d as RawMaterial)
    ),
  };
}

interface RawClass {
  class_id: number;
  class_name: string;
  grade: NullString | number | null;
  major: NullString | string;
  department: NullString | string;
  student_count: number;
  created_at: NullString | string;
}

function mapClass(r: RawClass): MaterialClass {
  return {
    class_id: r.class_id,
    class_name: r.class_name,
    grade: typeof r.grade === 'number' ? r.grade : null,
    major: nullStr(r.major),
    department: nullStr(r.department),
    student_count: r.student_count,
    created_at: nullStr(r.created_at),
  };
}

export async function getClasses() {
  const res = await client.get<ApiResponse<RawClass[]>>('/materials/classes');
  return { ...res.data, data: (res.data.data || []).map(mapClass) };
}

export async function getSemesters() {
  const res = await client.get<ApiResponse<string[]>>('/materials/semesters');
  return res.data;
}

export interface CreateMaterialPayload {
  isbn: string;
  title: string;
  author?: string;
  publisher?: string;
  price?: number;
  extra_info?: string;
  semester?: string;
  academic_year?: string;
  class_names?: string[];
}

export async function createMaterial(data: CreateMaterialPayload) {
  const res = await client.post<ApiResponse>('/materials', data);
  return res.data;
}

export interface UpdateMaterialPayload {
  isbn: string;
  title: string;
  author?: string;
  publisher?: string;
  price?: number;
  extra_info?: string;
}

export async function updateMaterial(id: number, data: UpdateMaterialPayload) {
  const res = await client.put<ApiResponse>(`/materials/${id}`, data);
  return res.data;
}

export async function deleteMaterial(id: number) {
  const res = await client.delete<ApiResponse>(`/materials/${id}`);
  return res.data;
}

// 预览 Excel 解析结果（不写库）
export async function previewMaterialsExcel(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await client.post<ApiResponse<ExcelPreview>>('/materials/preview', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// 导入 Excel（需指定学期）
export async function importMaterialsExcel(file: File, semester: string, academicYear?: string) {
  const fd = new FormData();
  fd.append('file', file);
  const params: Record<string, string> = { semester };
  if (academicYear) params.academic_year = academicYear;
  const res = await client.post<ApiResponse>('/materials/import', fd, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
