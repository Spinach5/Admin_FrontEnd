import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add, Refresh, Upload } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { AffairForm } from './AffairForm';
import { ExcelImportDialog } from '../Excel/ExcelImportDialog';
import { getAffairs, deleteAffair } from '../../api/affairs';
import type { Affair } from '../../api/types';

export function AffairList() {
  const [affairs, setAffairs] = useState<Affair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAffair, setEditingAffair] = useState<Affair | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Affair | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAffairs();
      if (res.success) setAffairs(res.data || []);
      else setError(res.message || '加载失败');
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteAffair(deleteTarget.id);
      if (res.success) { enqueueSnackbar('删除成功', { variant: 'success' }); load(); }
      else enqueueSnackbar(res.message || '删除失败', { variant: 'error' });
    } catch { enqueueSnackbar('网络错误', { variant: 'error' }); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns: Column<Affair>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: '事务名称' },
    { key: 'category', label: '事务种类' },
    { key: 'link', label: '链接', render: (r) => r.link ? <a href={r.link} target="_blank" rel="noopener">查看</a> : '-' },
    { key: 'details', label: '详情' },
    { key: 'channel', label: '渠道' },
    { key: 'created_at', label: '创建时间', render: (r) => r.created_at?.split('T')[0] },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>事务列表</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingAffair(null); setFormOpen(true); }} sx={{ mr: 1 }}>添加</Button>
          <Button variant="outlined" startIcon={<Upload />} onClick={() => setExcelOpen(true)} sx={{ mr: 1 }}>导入</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>刷新</Button>
        </Box>
      </Box>
      <DataTable columns={columns} data={affairs} loading={loading} error={error} onRefresh={load}
        onEdit={(row) => { setEditingAffair(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
      />
      <AffairForm open={formOpen} affair={editingAffair} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); load(); }} />
      <ConfirmDialog open={!!deleteTarget} title="确认删除" message={`确定要删除 "${deleteTarget?.name}" 吗？`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      <ExcelImportDialog open={excelOpen} onClose={() => setExcelOpen(false)} table="affairs" onSuccess={load} />
    </Box>
  );
}
