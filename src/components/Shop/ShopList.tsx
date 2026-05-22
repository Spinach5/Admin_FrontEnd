import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add, Refresh, Upload } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { ShopForm } from './ShopForm';
import { ExcelImportDialog } from '../Excel/ExcelImportDialog';
import { getShops, deleteShop } from '../../api/shops';
import type { Shop } from '../../api/types';

export function ShopList() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getShops();
      if (res.success) setShops(res.data || []);
      else setError(res.message || '加载失败');
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteShop(deleteTarget.id);
      if (res.success) { enqueueSnackbar('删除成功', { variant: 'success' }); load(); }
      else enqueueSnackbar(res.message || '删除失败', { variant: 'error' });
    } catch { enqueueSnackbar('网络错误', { variant: 'error' }); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns: Column<Shop>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: '店铺' },
    { key: 'canteen_name', label: '食堂' },
    { key: 'rating', label: '评分' },
    { key: 'comment', label: '备注' },
    { key: 'min', label: '最低价' },
    { key: 'max', label: '最高价' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>餐厅列表</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingShop(null); setFormOpen(true); }} sx={{ mr: 1 }}>添加</Button>
          <Button variant="outlined" startIcon={<Upload />} onClick={() => setExcelOpen(true)} sx={{ mr: 1 }}>导入</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>刷新</Button>
        </Box>
      </Box>
      <DataTable columns={columns} data={shops} loading={loading} error={error} onRefresh={load}
        onEdit={(row) => { setEditingShop(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
      />
      <ShopForm open={formOpen} shop={editingShop} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); load(); }} />
      <ConfirmDialog open={!!deleteTarget} title="确认删除" message={`确定要删除 "${deleteTarget?.name}" 吗？`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      <ExcelImportDialog open={excelOpen} onClose={() => setExcelOpen(false)} table="shops" onSuccess={load} />
    </Box>
  );
}
