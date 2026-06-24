import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, Typography, Dialog, DialogContent, IconButton, Chip, Tooltip } from '@mui/material';
import { Add, Refresh, Close } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DataTable, type Column } from '../Common/DataTable';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { SearchBar, type SearchField } from '../Common/SearchBar';
import { BookForm } from './BookForm';
import { getBooks, deleteBook } from '../../api/books';
import type { Book } from '../../api/types';

const SEARCH_FIELDS: SearchField[] = [
  { key: 'title', label: '书名' },
  { key: 'author', label: '作者' },
  { key: 'publisher', label: '出版社' },
  { key: 'category', label: '分类' },
  { key: 'isbn', label: 'ISBN' },
  { key: 'description', label: '描述' },
  { key: 'condition', label: '成色' },
  { key: 'contact', label: '联系方式' },
  { key: 'nickName', label: '发布者' },
  { key: 'stuId', label: '学号' },
];

export function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchField, setSearchField] = useState('');
  const [previewImages, setPreviewImages] = useState<{ title: string; images: { url: string }[] } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const { enqueueSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBooks();
      if (res.success) setBooks(res.data || []);
      else setError(res.message || '加载失败');
    } catch (err: any) {
      setError(err?.response?.data?.message || '网络错误');
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
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const bookTypeLabel = (t: number) => t === 1 ? '出售' : t === 2 ? '求购' : '出售';
  const deliveryLabel = (d: number) => d === 1 ? '可送' : '自提';

  const columns: Column<Book>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'title', label: '书名' },
    { key: 'author', label: '作者', render: (r) => r.author || '-' },
    { key: 'publisher', label: '出版社', render: (r) => r.publisher || '-' },
    { key: 'category', label: '分类' },
    {
      key: 'images',
      label: '书籍图片',
      render: (r) => {
        const allImages: { url: string }[] = [];
        if (r.cover_url) allImages.push({ url: r.cover_url });
        if (r.images && r.images.length > 0) {
          allImages.push(...r.images);
        } else if (r.image_url) {
          allImages.push({ url: r.image_url });
        }
        if (allImages.length === 0) return '暂无图片';
        return (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setPreviewImages({ title: r.title, images: allImages })}
          >
            {allImages.length}张图片
          </Button>
        );
      },
    },
    { key: 'price', label: '价格' },
    { key: 'isbn', label: 'ISBN' },
    {
      key: 'book_type',
      label: '类型',
      render: (r) => (
        <Chip
          label={bookTypeLabel(r.book_type)}
          size="small"
          color={r.book_type === 2 ? 'warning' : 'primary'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'is_delivery',
      label: '配送',
      render: (r) => (
        <Chip
          label={deliveryLabel(r.is_delivery)}
          size="small"
          color={r.is_delivery === 1 ? 'info' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'description',
      label: '描述',
      render: (r) => r.description
        ? <Tooltip title={r.description} arrow>
            <Typography noWrap sx={{ maxWidth: 150 }}>{r.description}</Typography>
          </Tooltip>
        : '-',
    },
    {
      key: 'condition',
      label: '成色',
      render: (r) => r.condition || '-',
    },
    { key: 'contact', label: '联系方式' },
    {
      key: 'want_count',
      label: '想要',
      render: (r) => r.want_count || 0,
    },
    {
      key: 'status',
      label: '状态',
      render: (r) => (
        <Chip
          label={r.status === 'active' ? '在售' : '下架'}
          size="small"
          color={r.status === 'active' ? 'success' : 'default'}
        />
      ),
    },
    { key: 'nickName', label: '发布者' },
    { key: 'stuId', label: '学号' },
  ];

  const filteredBooks = useMemo(() => {
    if (!searchKeyword.trim()) return books;
    const kw = searchKeyword.toLowerCase();
    return books.filter((b) => {
      if (searchField) {
        const v = (b as any)[searchField];
        return v != null && String(v).toLowerCase().includes(kw);
      }
      return SEARCH_FIELDS.some((f) => {
        const v = (b as any)[f.key];
        return v != null && String(v).toLowerCase().includes(kw);
      });
    });
  }, [books, searchKeyword, searchField]);

  const pagedBooks = filteredBooks.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = () => { setPage(1); };
  const handleClear = () => { setSearchKeyword(''); setSearchField(''); setPage(1); };

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
        data={pagedBooks}
        loading={loading}
        error={error}
        onRefresh={load}
        onEdit={(row) => { setEditingBook(row); setFormOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
        pagination={{
          page, pageSize, total: filteredBooks.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
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
      <Dialog open={!!previewImages} onClose={() => setPreviewImages(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{previewImages?.title} - 图片预览</Typography>
            <IconButton onClick={() => setPreviewImages(null)}><Close /></IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {previewImages?.images.map((img, idx) => (
              <Box
                key={idx}
                component="img"
                src={img.url}
                alt={`图片${idx + 1}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: '1px solid #eee',
                }}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
