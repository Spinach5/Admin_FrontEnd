import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createShop, updateShop } from '../../api/shops';
import type { Shop } from '../../api/types';

interface Props { open: boolean; shop: Shop | null; onClose: () => void; onSuccess: () => void; }

export function ShopForm({ open, shop, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [canteenName, setCanteenName] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!shop;

  useEffect(() => {
    if (shop) { setName(shop.name); setCanteenName(shop.canteen_name); setRating(String(shop.rating)); setComment(shop.comment); setMin(String(shop.min)); setMax(String(shop.max)); }
    else { setName(''); setCanteenName(''); setRating(''); setComment(''); setMin(''); setMax(''); }
  }, [shop, open]);

  const handleSubmit = async () => {
    if (!name || !canteenName) { enqueueSnackbar('请填写必填字段', { variant: 'error' }); return; }
    setLoading(true);
    const data = { name, canteen_name: canteenName, rating: parseFloat(rating) || 0, comment, min: parseFloat(min) || 0, max: parseFloat(max) || 0 };
    try {
      const res = isEdit ? await updateShop(shop!.id, data) : await createShop(data);
      if (res.success) { enqueueSnackbar(isEdit ? '更新成功' : '添加成功', { variant: 'success' }); onSuccess(); }
      else enqueueSnackbar(res.message || '操作失败', { variant: 'error' });
    } catch (err: any) { enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '编辑餐厅' : '添加餐厅'}</DialogTitle>
      <DialogContent>
        <TextField label="店铺名称" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="食堂名称" fullWidth margin="normal" value={canteenName} onChange={(e) => setCanteenName(e.target.value)} />
        <TextField label="评分" type="number" fullWidth margin="normal" value={rating} onChange={(e) => setRating(e.target.value)} />
        <TextField label="备注" fullWidth margin="normal" value={comment} onChange={(e) => setComment(e.target.value)} />
        <TextField label="最低价" type="number" fullWidth margin="normal" value={min} onChange={(e) => setMin(e.target.value)} />
        <TextField label="最高价" type="number" fullWidth margin="normal" value={max} onChange={(e) => setMax(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>取消</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{loading ? '提交中...' : '确认'}</Button>
      </DialogActions>
    </Dialog>
  );
}
