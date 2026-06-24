import { useState, useEffect, useMemo } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { SearchBar, type SearchField } from '../Common/SearchBar';
import { ClubForm } from './ClubForm';
import { getClubs, deleteClub } from '../../api/clubs';
import type { Club } from '../../api/types';

const SEARCH_FIELDS: SearchField[] = [
  { key: 'name', label: '社团名称' },
  { key: 'category', label: '类别' },
  { key: 'schoolId', label: '学校' },
  { key: 'introduction', label: '简介' },
  { key: 'contact', label: '联系方式' },
  { key: 'principal_name', label: '负责人' },
];

export function ClubList() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchField, setSearchField] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // 定义加载函数，供按钮刷新和初始加载复用
  // 注意：不再用 useCallback 包裹以避免依赖复杂性，直接定义即可
  const load = async () => {
    setLoading(true); 
    setError(null);
    try {
      const res = await getClubs();
      if (res.success) setClubs(res.data || []);
      else setError(res.message || '加载失败');
    } catch (err: any) {
      setError(err?.response?.data?.message || '网络错误');
    }
    finally {
      setLoading(false);
    }
  };

  // 初始加载：仅在组件挂载时执行一次
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，确保只运行一次

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteClub(deleteTarget.id);
      if (res.success) {
        enqueueSnackbar('删除成功', { variant: 'success' });
        load();
      }
      else enqueueSnackbar(res.message || '删除失败', { variant: 'error' });
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    }
    finally { 
      setDeleting(false); 
      setDeleteTarget(null); 
    }
  };

  const columns: Column<Club>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: '社团名称' },
    { key: 'category', label: '类别' },
    { key: 'schoolId', label: '学校' },
    { key: 'nature', label: '性质', render: (row: Club) => ({ 0: '社团', 1: '学生会', 2: '其他' }[row.nature] ?? row.nature) },
    { key: 'introduction', label: '简介' },
    { key: 'principal_name', label: '负责人', render: (row: Club) => row.principal_name || '-' },
    { key: 'contact', label: '联系方式' },
  ];

  const filteredClubs = useMemo(() => {
    if (!searchKeyword.trim()) return clubs;
    const kw = searchKeyword.toLowerCase();
    return clubs.filter((c) => {
      if (searchField) {
        const v = (c as any)[searchField];
        return v != null && String(v).toLowerCase().includes(kw);
      }
      return SEARCH_FIELDS.some((f) => {
        const v = (c as any)[f.key];
        return v != null && String(v).toLowerCase().includes(kw);
      });
    });
  }, [clubs, searchKeyword, searchField]);

  const pagedClubs = filteredClubs.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = () => { setPage(1); };
  const handleClear = () => { setSearchKeyword(''); setSearchField(''); setPage(1); };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>社团列表</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingClub(null); setFormOpen(true); }} sx={{ mr: 1 }}>添加</Button>
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
      <DataTable columns={columns} data={pagedClubs} loading={loading} error={error} onRefresh={load}
        onEdit={(row) => { setEditingClub(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
        pagination={{
          page, pageSize, total: filteredClubs.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />
      <ClubForm open={formOpen} club={editingClub} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); load(); }} />
      <ConfirmDialog open={!!deleteTarget} title="确认删除" message={`确定要删除 "${deleteTarget?.name}" 吗？`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </Box>
  );
}