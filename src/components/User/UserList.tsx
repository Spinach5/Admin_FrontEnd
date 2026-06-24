import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, Tooltip } from '@mui/material';
import { Add, Refresh, Lock, LockOpen } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { SearchBar, type SearchField } from '../Common/SearchBar';
import { UserForm } from './UserForm';
import { getUsers, deleteUser, hardDeleteUser, freezeUser } from '../../api/users';
import type { NormalUser } from '../../api/types';

const SEARCH_FIELDS: SearchField[] = [
  { key: 'stuId', label: '学号' },
  { key: 'nickName', label: '昵称' },
  { key: 'schoolId', label: '学校ID' },
];

export function UserList() {
  const [users, setUsers] = useState<NormalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<NormalUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NormalUser | null>(null);
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
      const res = await getUsers();
      if (res.success) setUsers(res.data || []);
      else setError(res.message || '加载失败');
    } catch (err: any) {
      setError(err?.response?.data?.message || '网络错误');
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
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
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
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleFreeze = async (user: NormalUser) => {
    const willFreeze = !user.is_frozen;
    try {
      const res = await freezeUser(user.id, willFreeze);
      if (res.success) {
        enqueueSnackbar(willFreeze ? '已冻结' : '已解冻', { variant: 'success' });
        load();
      } else {
        enqueueSnackbar(res.message || '操作失败', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    }
  };

  const columns: Column<NormalUser>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'stuId', label: '学号' },
    { key: 'nickName', label: '昵称' },
    { key: 'schoolId', label: '学校ID' },
    {
      key: 'is_frozen',
      label: '状态',
      render: (r) => (
        <Tooltip title={r.is_frozen ? '点击解冻' : '点击冻结'}>
          <Chip
            icon={r.is_frozen ? <Lock sx={{ fontSize: 14 }} /> : <LockOpen sx={{ fontSize: 14 }} />}
            label={r.is_frozen ? '已冻结' : '正常'}
            size="small"
            color={r.is_frozen ? 'error' : 'success'}
            onClick={() => handleFreeze(r)}
            sx={{ cursor: 'pointer' }}
          />
        </Tooltip>
      ),
    },
    { key: 'createdAt', label: '创建时间', render: (r) => r.createdAt?.split('T')[0] },
  ];

  const filteredUsers = useMemo(() => {
    if (!searchKeyword.trim()) return users;
    const kw = searchKeyword.toLowerCase();
    return users.filter((u) => {
      if (searchField) {
        const v = (u as any)[searchField];
        return v != null && String(v).toLowerCase().includes(kw);
      }
      return SEARCH_FIELDS.some((f) => {
        const v = (u as any)[f.key];
        return v != null && String(v).toLowerCase().includes(kw);
      });
    });
  }, [users, searchKeyword, searchField]);

  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = () => { setPage(1); };
  const handleClear = () => { setSearchKeyword(''); setSearchField(''); setPage(1); };

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
        data={pagedUsers}
        loading={loading}
        error={error}
        onRefresh={load}
        onEdit={(row) => { setEditingUser(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
        pagination={{
          page, pageSize, total: filteredUsers.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
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
