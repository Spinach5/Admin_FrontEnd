import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createFood, updateFood } from '../../api/foods';
import type { Food } from '../../api/types';

interface Props { open: boolean; food: Food | null; onClose: () => void; onSuccess: () => void; }

export function FoodForm({ open, food, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [canteenName, setCanteenName] = useState('');
  const [price, setPrice] = useState('');
  const [taste, setTaste] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!food;

  useEffect(() => {
    if (food) { setName(food.name); setShopName(food.shop_name); setCanteenName(food.canteen_name); setPrice(String(food.price)); setTaste(food.taste); setCategory(food.category); }
    else { setName(''); setShopName(''); setCanteenName(''); setPrice(''); setTaste(''); setCategory(''); }
  }, [food, open]);

  const handleSubmit = async () => {
    if (!name || !shopName) { enqueueSnackbar('请填写必填字段', { variant: 'error' }); return; }
    setLoading(true);
    const data = { name, shop_name: shopName, canteen_name: canteenName, price: parseFloat(price) || 0, taste, category };
    try {
      const res = isEdit ? await updateFood(food!.id, data) : await createFood(data);
      if (res.success) { enqueueSnackbar(isEdit ? '更新成功' : '添加成功', { variant: 'success' }); onSuccess(); }
      else enqueueSnackbar(res.message || '操作失败', { variant: 'error' });
    } catch { enqueueSnackbar('网络错误', { variant: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '编辑食物' : '添加食物'}</DialogTitle>
      <DialogContent>
        <TextField label="食物名称" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="店铺" fullWidth margin="normal" value={shopName} onChange={(e) => setShopName(e.target.value)} />
        <TextField label="食堂" fullWidth margin="normal" value={canteenName} onChange={(e) => setCanteenName(e.target.value)} />
        <TextField label="价格" type="number" fullWidth margin="normal" value={price} onChange={(e) => setPrice(e.target.value)} />
        <TextField label="口味" fullWidth margin="normal" value={taste} onChange={(e) => setTaste(e.target.value)} />
        <TextField label="种类" fullWidth margin="normal" value={category} onChange={(e) => setCategory(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>取消</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{loading ? '提交中...' : '确认'}</Button>
      </DialogActions>
    </Dialog>
  );
}
