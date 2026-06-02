import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createBook, updateBook } from '../../api/books';
import type { Book } from '../../api/types';

interface Props {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookForm({ open, book, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [isbn, setIsbn] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!book;

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setCategory(book.category);
      setPrice(book.price);
      setIsbn(book.isbn);
      setStatus(book.status);
    } else {
      setTitle('');
      setCategory('');
      setPrice('');
      setIsbn('');
      setStatus('active');
    }
  }, [book, open]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      enqueueSnackbar('书名不能为空', { variant: 'error' });
      return;
    }

    setLoading(true);
    const data = { title: title.trim(), category, price, isbn, user_id: 0, status };
    try {
      const res = isEdit ? await updateBook(book!.id, data) : await createBook(data);
      if (res.success) {
        enqueueSnackbar(isEdit ? '更新成功' : '添加成功', { variant: 'success' });
        onSuccess();
      } else {
        enqueueSnackbar(res.message || '操作失败', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('网络错误', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '编辑书籍' : '添加书籍'}</DialogTitle>
      <DialogContent>
        <TextField label="书名" fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="分类" fullWidth margin="normal" value={category} onChange={(e) => setCategory(e.target.value)} />
        <TextField label="价格" fullWidth margin="normal" value={price} onChange={(e) => setPrice(e.target.value)} />
        <TextField label="ISBN" fullWidth margin="normal" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        <FormControl fullWidth margin="normal">
          <InputLabel>状态</InputLabel>
          <Select value={status} label="状态" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="active">在售</MenuItem>
            <MenuItem value="inactive">下架</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>取消</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? '提交中...' : '确认'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
