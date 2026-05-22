import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createAffairCategory, updateAffairCategory } from '../../api/affairCategories';
import type { AffairCategory } from '../../api/types';

interface Props { open: boolean; category: AffairCategory | null; onClose: () => void; onSuccess: () => void; }

export function AffairCategoryForm({ open, category, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!category;

  useEffect(() => {
    setName(category ? category.name : '');
  }, [category, open]);

  const handleSubmit = async () => {
    if (!name.trim()) { enqueueSnackbar('名称不能为空', { variant: 'error' }); return; }
    setLoading(true);
    try {
      const res = isEdit ? await updateAffairCategory(category!.id, { name }) : await createAffairCategory({ name });
      if (res.success) { enqueueSnackbar(isEdit ? '更新成功' : '添加成功', { variant: 'success' }); onSuccess(); }
      else enqueueSnackbar(res.message || '操作失败', { variant: 'error' });
    } catch { enqueueSnackbar('网络错误', { variant: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? '编辑事务种类' : '添加事务种类'}</DialogTitle>
      <DialogContent>
        <TextField label="种类名称" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>取消</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{loading ? '提交中...' : '确认'}</Button>
      </DialogActions>
    </Dialog>
  );
}
