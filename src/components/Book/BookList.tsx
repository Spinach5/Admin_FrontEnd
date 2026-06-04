import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Link } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { BookForm } from './BookForm';
import { getBooks, deleteBook } from '../../api/books';
import type { Book } from '../../api/types';

export function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBooks();
      if (res.success) setBooks(res.data || []);
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
      const res = await deleteBook(deleteTarget.id);
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

  const columns: Column<Book>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'title', label: '书名' },
    { key: 'category', label: '分类' },
    { key: 'image', label: '书籍图片', render: (r) => r.image_url
      ? <Link href={r.image_url} target="_blank" rel="noopener" sx={{ cursor: 'pointer' }}>点击查看</Link>
      : '暂无图片' },
    { key: 'price', label: '价格' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'contact', label: '联系方式' },
    { key: 'status', label: '状态', render: (r) => r.status === 'active' ? '在售' : '下架' },
    { key: 'nickName', label: '发布者' },
    { key: 'stuId', label: '学号' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>书籍列表</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingBook(null); setFormOpen(true); }} sx={{ mr: 1 }}>
            添加
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>刷新</Button>
        </Box>
      </Box>
      <DataTable
        columns={columns}
        data={books}
        loading={loading}
        error={error}
        onRefresh={load}
        onEdit={(row) => { setEditingBook(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
      />
      <BookForm
        open={formOpen}
        book={editingBook}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); load(); }}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        message={`确定要删除书籍 "${deleteTarget?.title}" 吗？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Box>
  );
}
