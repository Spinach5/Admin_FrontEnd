import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { UserForm } from './UserForm';
import { getUsers, deleteUser, hardDeleteUser } from '../../api/users';
import type { NormalUser } from '../../api/types';

export function UserList() {
  const [users, setUsers] = useState<NormalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<NormalUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NormalUser | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  const handleSoftDelete = async () => {
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

  const handleHardDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await hardDeleteUser(deleteTarget.id);
      if (res.success) {
        enqueueSnackbar('已彻底删除', { variant: 'success' });
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

  const columns: Column<NormalUser>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'stuId', label: '学号' },
    { key: 'nickName', label: '昵称' },
    { key: 'schoolId', label: '学校ID' },
    { key: 'createdAt', label: '创建时间', render: (r) => r.createdAt?.split('T')[0] },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>用户列表</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingUser(null); setFormOpen(true); }} sx={{ mr: 1 }}>
            添加
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>刷新</Button>
        </Box>
      </Box>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        onRefresh={load}
        onEdit={(row) => { setEditingUser(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
      />
      <UserForm
        open={formOpen}
        user={editingUser}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); load(); }}
      />
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除用户 "{deleteTarget?.nickName}" 吗？请选择删除方式：
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>取消</Button>
          <Button onClick={handleSoftDelete} color="warning" variant="contained" disabled={deleting}>
            {deleting ? '处理中...' : '软删除'}
          </Button>
          <Button onClick={handleHardDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? '处理中...' : '硬删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
