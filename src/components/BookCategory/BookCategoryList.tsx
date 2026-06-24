import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { SearchBar, type SearchField } from '../Common/SearchBar';
import { BookCategoryForm } from './BookCategoryForm';
import { getBookCategories, deleteBookCategory } from '../../api/bookCategories';
import type { BookCategory } from '../../api/types';

const SEARCH_FIELDS: SearchField[] = [
  { key: 'name', label: '种类名称' },
  { key: 'school_id', label: '学校' },
];

export function BookCategoryList() {
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<BookCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchField, setSearchField] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBookCategories();
      if (res.success) setCategories(res.data || []);
      else setError(res.message || '加载失败');
    } catch (err: any) {
      setError(err?.response?.data?.message || '网络错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteBookCategory(deleteTarget.id);
      if (res.success) {
        enqueueSnackbar('删除成功', { variant: 'success' });
        load();
      } else {
        enqueueSnackbar(res.message || '删除失败', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns: Column<BookCategory>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: '种类名称' },
    {
      key: 'book_count',
      label: '书籍数量',
      render: (r) => (
        <Chip
          label={r.book_count}
          size="small"
          color={r.book_count > 0 ? 'primary' : 'default'}
          variant="outlined"
        />
      ),
    },
    { key: 'sort_order', label: '排序', width: '80px' },
    { key: 'school_id', label: '学校', width: '100px' },
  ];

  const filteredCategories = useMemo(() => {
    if (!searchKeyword.trim()) return categories;
    const kw = searchKeyword.toLowerCase();
    return categories.filter((c) => {
      if (searchField) {
        const v = (c as any)[searchField];
        return v != null && String(v).toLowerCase().includes(kw);
      }
      return SEARCH_FIELDS.some((f) => {
        const v = (c as any)[f.key];
        return v != null && String(v).toLowerCase().includes(kw);
      });
    });
  }, [categories, searchKeyword, searchField]);

  const pagedCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = () => { setPage(1); };
  const handleClear = () => { setSearchKeyword(''); setSearchField(''); setPage(1); };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>书籍种类</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { setEditingCat(null); setFormOpen(true); }}
            sx={{ mr: 1 }}
          >
            添加
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>刷新</Button>
        </Box>
      </Box>
      <SearchBar
        fields={SEARCH_FIELDS}
        keyword={searchKeyword}
        field={searchField}
        onKeywordChange={setSearchKeyword}
        onFieldChange={setSearchField}
        onSearch={handleSearch}
        onClear={handleClear}
      />
      <DataTable
        columns={columns}
        data={pagedCategories}
        loading={loading}
        error={error}
        onRefresh={load}
        onEdit={(row) => { setEditingCat(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
        pagination={{
          page, pageSize, total: filteredCategories.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />
      <BookCategoryForm
        open={formOpen}
        category={editingCat}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); load(); }}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={`确定要删除书籍种类 "${deleteTarget?.name}" 吗？该种类下的所有书籍也会被删除。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Box>
  );
}
