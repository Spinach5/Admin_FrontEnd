import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { SearchBar, type SearchField } from '../Common/SearchBar';
import { AffairCategoryForm } from './AffairCategoryForm';
import { getAffairCategories, deleteAffairCategory } from '../../api/affairCategories';
import type { AffairCategory } from '../../api/types';

const SEARCH_FIELDS: SearchField[] = [
  { key: 'name', label: '名称' },
];

export function AffairCategoryList() {
  const [categories, setCategories] = useState<AffairCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AffairCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AffairCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchField, setSearchField] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAffairCategories();
      if (res.success) setCategories(res.data || []);
      else setError(res.message || '加载失败');
    } catch (err: any) { setError(err?.response?.data?.message || '网络错误'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteAffairCategory(deleteTarget.id);
      if (res.success) { enqueueSnackbar('删除成功', { variant: 'success' }); load(); }
      else enqueueSnackbar(res.message || '删除失败', { variant: 'error' });
    } catch (err: any) { enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' }); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns: Column<AffairCategory>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: '事务种类' },
    { key: 'created_at', label: '创建时间', render: (r) => r.created_at?.split('T')[0] },
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
        <Typography variant="h5" sx={{ fontWeight: 600 }}>事务种类</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingCat(null); setFormOpen(true); }} sx={{ mr: 1 }}>添加</Button>
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
      <DataTable columns={columns} data={pagedCategories} loading={loading} error={error} onRefresh={load}
        onEdit={(row) => { setEditingCat(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
        pagination={{
          page, pageSize, total: filteredCategories.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />
      <AffairCategoryForm open={formOpen} category={editingCat} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); load(); }} />
      <ConfirmDialog open={!!deleteTarget} title="确认删除" message={`确定要删除 "${deleteTarget?.name}" 吗？`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </Box>
  );
}
