import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Button, Typography, Chip, Tooltip, TextField, Stack, Autocomplete,
} from '@mui/material';
import { Add, Refresh, Upload, Search, Clear } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { MaterialForm } from './MaterialForm';
import { MaterialExcelImportDialog } from './MaterialExcelImportDialog';
import { getMaterials, deleteMaterial, getClasses, getSemesters } from '../../api/materials';
import type { Material, MaterialClass } from '../../api/types';

export function MaterialList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [classes, setClasses] = useState<MaterialClass[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 筛选条件
  const [semester, setSemester] = useState('');
  const [className, setClassName] = useState('');
  const [keyword, setKeyword] = useState('');
  // 实际查询时使用的条件（点搜索后才更新）
  const [querySemester, setQuerySemester] = useState('');
  const [queryClassName, setQueryClassName] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { semester?: string; class_name?: string; keyword?: string } = {};
      if (querySemester.trim()) params.semester = querySemester.trim();
      if (queryClassName.trim()) params.class_name = queryClassName.trim();
      if (queryKeyword.trim()) params.keyword = queryKeyword.trim();
      const res = await getMaterials(Object.keys(params).length > 0 ? params : undefined);
      if (res.success) setMaterials(res.data || []);
      else setError(res.message || '加载失败');
    } catch (err: any) {
      setError(err?.response?.data?.message || '网络错误');
    } finally {
      setLoading(false);
    }
  }, [querySemester, queryClassName, queryKeyword]);

  const loadClasses = useCallback(async () => {
    try {
      const res = await getClasses();
      if (res.success) setClasses(res.data || []);
    } catch {
      // 班级列表加载失败不影响主流程
    }
  }, []);

  const loadSemesters = useCallback(async () => {
    try {
      const res = await getSemesters();
      if (res.success) setSemesters(res.data || []);
    } catch {
      // 学期列表加载失败不影响主流程
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadClasses(); }, [loadClasses]);
  useEffect(() => { loadSemesters(); }, [loadSemesters]);

  const handleSearch = () => {
    setQuerySemester(semester);
    setQueryClassName(className);
    setQueryKeyword(keyword);
    setPage(1);
  };

  const handleClear = () => {
    setSemester('');
    setClassName('');
    setKeyword('');
    setQuerySemester('');
    setQueryClassName('');
    setQueryKeyword('');
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteMaterial(deleteTarget.id);
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

  const hasFilters = querySemester || queryClassName || queryKeyword;

  const columns: Column<Material>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'title', label: '书名' },
    { key: 'author', label: '作者', render: (r) => r.author || '-' },
    { key: 'publisher', label: '出版社', render: (r) => r.publisher || '-' },
    {
      key: 'price',
      label: '单价',
      render: (r) => r.price > 0 ? `¥${r.price.toFixed(2)}` : '-',
    },
    {
      key: 'semester',
      label: '学期',
      render: (r) => r.semester || '-',
    },
    {
      key: 'classes',
      label: '关联班级',
      render: (r) => {
        if (!r.classes || r.classes.length === 0) return '-';
        const list = r.classes;
        const display = list.slice(0, 3);
        const rest = list.length - display.length;
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {display.map((c) => (
              <Chip key={c} label={c} size="small" variant="outlined" color="primary" />
            ))}
            {rest > 0 && (
              <Tooltip title={list.join('、')}>
                <Chip label={`+${rest}`} size="small" />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      key: 'extra_info',
      label: '备注',
      render: (r) => r.extra_info
        ? <Tooltip title={r.extra_info} arrow><Typography noWrap sx={{ maxWidth: 150 }}>{r.extra_info}</Typography></Tooltip>
        : '-',
    },
    {
      key: 'created_at',
      label: '创建时间',
      render: (r) => r.created_at || '-',
    },
  ];

  const pagedMaterials = useMemo(() => {
    return materials.slice((page - 1) * pageSize, page * pageSize);
  }, [materials, page, pageSize]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>教材列表</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingMaterial(null); setFormOpen(true); }} sx={{ mr: 1 }}>添加</Button>
          <Button variant="outlined" startIcon={<Upload />} onClick={() => setExcelOpen(true)} sx={{ mr: 1 }}>导入</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>刷新</Button>
        </Box>
      </Box>

      {/* 筛选区：学期 + 班级 + 关键字 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Autocomplete
          size="small"
          sx={{ minWidth: 160 }}
          options={semesters}
          value={semester || null}
          onChange={(_, newValue) => setSemester(newValue || '')}
          renderInput={(params) => <TextField {...params} label="学期" placeholder="选择学期" />}
          filterOptions={(options, state) => {
            const inputValue = state.inputValue.toLowerCase();
            return options.filter((option) =>
              option.toLowerCase().includes(inputValue)
            );
          }}
          noOptionsText="无匹配学期"
          clearOnBlur
        />
        <Autocomplete
          size="small"
          sx={{ minWidth: 200 }}
          options={classes.map((c) => c.class_name)}
          value={className || null}
          onChange={(_, newValue) => setClassName(newValue || '')}
          renderInput={(params) => <TextField {...params} label="班级" placeholder="搜索班级名称" />}
          filterOptions={(options, state) => {
            const inputValue = state.inputValue.toLowerCase();
            return options.filter((option) =>
              option.toLowerCase().includes(inputValue)
            );
          }}
          noOptionsText="无匹配班级"
          clearOnBlur
          handleHomeEndKeys
        />
        <TextField
          size="small"
          label="关键字（ISBN/书名/作者/出版社）"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 240 }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        />
        <Button variant="contained" startIcon={<Search />} onClick={handleSearch} size="small">搜索</Button>
        {hasFilters && (
          <Button variant="outlined" startIcon={<Clear />} onClick={handleClear} size="small">清除</Button>
        )}
      </Box>

      {hasFilters && (
        <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
          {querySemester && <Chip label={`学期: ${querySemester}`} size="small" onDelete={() => { setQuerySemester(''); setSemester(''); }} />}
          {queryClassName && <Chip label={`班级: ${queryClassName}`} size="small" onDelete={() => { setQueryClassName(''); setClassName(''); }} />}
          {queryKeyword && <Chip label={`关键字: ${queryKeyword}`} size="small" onDelete={() => { setQueryKeyword(''); setKeyword(''); }} />}
        </Stack>
      )}

      <DataTable
        columns={columns}
        data={pagedMaterials}
        loading={loading}
        error={error}
        onRefresh={load}
        onEdit={(row) => { setEditingMaterial(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
        emptyText={hasFilters ? '未找到匹配的教材' : '暂无教材数据'}
        pagination={{
          page, pageSize, total: materials.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />

      <MaterialForm
        open={formOpen}
        material={editingMaterial}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); load(); }}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={`确定要删除教材 "${deleteTarget?.title}" 吗？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
      <MaterialExcelImportDialog
        open={excelOpen}
        onClose={() => setExcelOpen(false)}
        onSuccess={load}
      />
    </Box>
  );
}
