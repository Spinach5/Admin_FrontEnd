import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { AffairCategoryForm } from './AffairCategoryForm';
import { getAffairCategories, deleteAffairCategory } from '../../api/affairCategories';
import type { AffairCategory } from '../../api/types';

export function AffairCategoryList() {
  const [categories, setCategories] = useState<AffairCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AffairCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AffairCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAffairCategories();
      if (res.success) setCategories(res.data || []);
      else setError(res.message || '加载失败');
    } catch { setError('网络错误'); }
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
    } catch { enqueueSnackbar('网络错误', { variant: 'error' }); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns: Column<AffairCategory>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: '事务种类' },
    { key: 'created_at', label: '创建时间', render: (r) => r.created_at?.split('T')[0] },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>事务种类</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingCat(null); setFormOpen(true); }} sx={{ mr: 1 }}>添加</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>刷新</Button>
        </Box>
      </Box>
      <DataTable columns={columns} data={categories} loading={loading} error={error} onRefresh={load}
        onEdit={(row) => { setEditingCat(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
      />
      <AffairCategoryForm open={formOpen} category={editingCat} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); load(); }} />
      <ConfirmDialog open={!!deleteTarget} title="确认删除" message={`确定要删除 "${deleteTarget?.name}" 吗？`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </Box>
  );
}
