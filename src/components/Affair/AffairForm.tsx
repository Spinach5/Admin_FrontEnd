import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createAffair, updateAffair } from '../../api/affairs';
import type { Affair } from '../../api/types';

interface Props { open: boolean; affair: Affair | null; onClose: () => void; onSuccess: () => void; }

export function AffairForm({ open, affair, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [link, setLink] = useState('');
  const [details, setDetails] = useState('');
  const [channel, setChannel] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!affair;

  useEffect(() => {
    if (affair) { setName(affair.name); setCategory(affair.category); setLink(affair.link); setDetails(affair.details); setChannel(affair.channel); }
    else { setName(''); setCategory(''); setLink(''); setDetails(''); setChannel(''); }
  }, [affair, open]);

  const handleSubmit = async () => {
    if (!name || !category) { enqueueSnackbar('请填写必填字段', { variant: 'error' }); return; }
    setLoading(true);
    const data = { name, category, link, details, channel };
    try {
      const res = isEdit ? await updateAffair(affair!.id, data) : await createAffair(data);
      if (res.success) { enqueueSnackbar(isEdit ? '更新成功' : '添加成功', { variant: 'success' }); onSuccess(); }
      else enqueueSnackbar(res.message || '操作失败', { variant: 'error' });
    } catch { enqueueSnackbar('网络错误', { variant: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '编辑事务' : '添加事务'}</DialogTitle>
      <DialogContent>
        <TextField label="事务名称" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="事务种类" fullWidth margin="normal" value={category} onChange={(e) => setCategory(e.target.value)} />
        <TextField label="链接" fullWidth margin="normal" value={link} onChange={(e) => setLink(e.target.value)} />
        <TextField label="详情" fullWidth multiline rows={3} margin="normal" value={details} onChange={(e) => setDetails(e.target.value)} />
        <TextField label="渠道" fullWidth margin="normal" value={channel} onChange={(e) => setChannel(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>取消</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{loading ? '提交中...' : '确认'}</Button>
      </DialogActions>
    </Dialog>
  );
}
