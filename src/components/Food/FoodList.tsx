import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add, Refresh, Upload } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { SearchBar, type SearchField } from '../Common/SearchBar';
import { FoodForm } from './FoodForm';
import { ExcelImportDialog } from '../Excel/ExcelImportDialog';
import { getFoods, deleteFood } from '../../api/foods';
import type { Food } from '../../api/types';

const SEARCH_FIELDS: SearchField[] = [
  { key: 'name', label: '名称' },
  { key: 'shop_name', label: '店铺' },
  { key: 'canteen_name', label: '食堂' },
  { key: 'taste', label: '口味' },
  { key: 'category', label: '种类' },
];

export function FoodList() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Food | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchField, setSearchField] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getFoods();
      if (res.success) setFoods(res.data || []);
      else setError(res.message || '加载失败');
    } catch (err: any) { setError(err?.response?.data?.message || '网络错误'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteFood(deleteTarget.id);
      if (res.success) { enqueueSnackbar('删除成功', { variant: 'success' }); load(); }
      else enqueueSnackbar(res.message || '删除失败', { variant: 'error' });
    } catch (err: any) { enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' }); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns: Column<Food>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: '名称' },
    { key: 'shop_name', label: '店铺' },
    { key: 'canteen_name', label: '食堂' },
    { key: 'price', label: '价格' },
    { key: 'taste', label: '口味' },
    { key: 'category', label: '种类' },
  ];

  const filteredFoods = useMemo(() => {
    if (!searchKeyword.trim()) return foods;
    const kw = searchKeyword.toLowerCase();
    return foods.filter((f) => {
      if (searchField) {
        const v = (f as any)[searchField];
        return v != null && String(v).toLowerCase().includes(kw);
      }
      return SEARCH_FIELDS.some((sf) => {
        const v = (f as any)[sf.key];
        return v != null && String(v).toLowerCase().includes(kw);
      });
    });
  }, [foods, searchKeyword, searchField]);

  const pagedFoods = filteredFoods.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = () => { setPage(1); };
  const handleClear = () => { setSearchKeyword(''); setSearchField(''); setPage(1); };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>食物列表</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingFood(null); setFormOpen(true); }} sx={{ mr: 1 }}>添加</Button>
          <Button variant="outlined" startIcon={<Upload />} onClick={() => setExcelOpen(true)} sx={{ mr: 1 }}>导入</Button>
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
      <DataTable columns={columns} data={pagedFoods} loading={loading} error={error} onRefresh={load}
        onEdit={(row) => { setEditingFood(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
        pagination={{
          page, pageSize, total: filteredFoods.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />
      <FoodForm open={formOpen} food={editingFood} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); load(); }} />
      <ConfirmDialog open={!!deleteTarget} title="确认删除" message={`确定要删除 "${deleteTarget?.name}" 吗？`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      <ExcelImportDialog open={excelOpen} onClose={() => setExcelOpen(false)} table="foods" onSuccess={load} />
    </Box>
  );
}
