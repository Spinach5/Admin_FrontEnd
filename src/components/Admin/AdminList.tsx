import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { AdminForm } from './AdminForm';
import { getUsers, deleteUser } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../api/types';

export function AdminList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user: me } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      if (res.success) setUsers(res.data || []);
      else setError(res.message || '加载失败');
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteUser(deleteTarget.id);
      if (res.success) {
        enqueueSnackbar('删除成功', { variant: 'success' });
        load();
      } else {
        enqueueSnackbar(res.message || '删除失败', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('网络错误', { variant: 'error' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns: Column<User>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'account', label: '账户' },
    { key: 'schoolId', label: '学校代码' },
    { key: 'super', label: '管理员', render: (r) => r.is_super === 1 ? '是' : '否' },
    { key: 'active', label: '状态', render: (r) => r.is_active === 1 ? '已登录' : '未登录' },
    { key: 'created_at', label: '创建时间', render: (r) => r.created_at?.split('T')[0] },
    { key: 'updated_at', label: '更新时间', render: (r) => r.updated_at?.split('T')[0] },
  ];

  const isSuper = me?.is_super === 1;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>管理员列表</Typography>
        <Box>
          {isSuper && (
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingUser(null); setFormOpen(true); }} sx={{ mr: 1 }}>
              添加
            </Button>
          )}
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>刷新</Button>
        </Box>
      </Box>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        onRefresh={load}
        onEdit={isSuper ? (row) => { setEditingUser(row); setFormOpen(true); } : undefined}
        onDelete={isSuper ? (row) => setDeleteTarget(row) : undefined}
      />
      <AdminForm
        open={formOpen}
        user={editingUser}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); load(); }}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={`确定要删除用户 "${deleteTarget?.account}" 吗？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Box>
  );
}
