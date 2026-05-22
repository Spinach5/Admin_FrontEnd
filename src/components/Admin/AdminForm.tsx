import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { createUser, updateUser } from '../../api/admin';
import type { User } from '../../api/types';

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminForm({ open, user, onClose, onSuccess }: Props) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isSuper, setIsSuper] = useState(0);
  const [isActive, setIsActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      setAccount(user.account);
      setPassword('');
      setIsSuper(user.is_super);
      setIsActive(user.is_active);
    } else {
      setAccount('');
      setPassword('');
      setIsSuper(0);
      setIsActive(0);
    }
  }, [user, open]);

  const handleSubmit = async () => {
    if (!account.trim()) { enqueueSnackbar('账号不能为空', { variant: 'error' }); return; }
    if (!isEdit && !password) { enqueueSnackbar('密码不能为空', { variant: 'error' }); return; }
    if (password && password.length < 8) { enqueueSnackbar('密码至少8位', { variant: 'error' }); return; }

    setLoading(true);
    try {
      const res = isEdit
        ? await updateUser(user!.id, { account, password: password || undefined, is_super: isSuper, is_active: isActive })
        : await createUser({ account, password, is_super: isSuper });
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
      <DialogTitle>{isEdit ? '编辑用户' : '添加用户'}</DialogTitle>
      <DialogContent>
        <TextField label="账号" fullWidth margin="normal" value={account} onChange={(e) => setAccount(e.target.value)} />
        <TextField label={isEdit ? '新密码 (留空不修改)' : '密码'} type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        <FormControl fullWidth margin="normal">
          <InputLabel>管理员权限</InputLabel>
          <Select value={isSuper} label="管理员权限" onChange={(e) => setIsSuper(Number(e.target.value))}>
            <MenuItem value={0}>普通用户</MenuItem>
            <MenuItem value={1}>超级管理员</MenuItem>
          </Select>
        </FormControl>
        {isEdit && (
          <FormControl fullWidth margin="normal">
            <InputLabel>登录状态</InputLabel>
            <Select value={isActive} label="登录状态" onChange={(e) => setIsActive(Number(e.target.value))}>
              <MenuItem value={0}>未登录</MenuItem>
              <MenuItem value={1}>已登录</MenuItem>
            </Select>
          </FormControl>
        )}
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
