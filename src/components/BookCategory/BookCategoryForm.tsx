import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createBookCategory, updateBookCategory } from '../../api/bookCategories';
import type { BookCategory } from '../../api/types';

interface Props {
  open: boolean;
  category: BookCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookCategoryForm({ open, category, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!category;

  useEffect(() => {
    setName(category ? category.name : '');
  }, [category, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      enqueueSnackbar('种类名称不能为空', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = isEdit
        ? await updateBookCategory(category!.id, { name, sort_order: category!.sort_order })
        : await createBookCategory({ name });
      if (res.success) {
        enqueueSnackbar(isEdit ? '更新成功' : '添加成功', { variant: 'success' });
        onSuccess();
      } else {
        enqueueSnackbar(res.message || '操作失败', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? '编辑书籍种类' : '添加书籍种类'}</DialogTitle>
      <DialogContent>
        <TextField
          label="种类名称"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
