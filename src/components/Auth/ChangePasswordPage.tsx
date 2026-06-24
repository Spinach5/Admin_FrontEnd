import { useState } from 'react';
import { Box, Card, TextField, Button, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { changePassword } from '../../api/auth';

export function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      enqueueSnackbar('请填写所有字段', { variant: 'error' }); return;
    }
    if (newPassword.length < 8) {
      enqueueSnackbar('新密码至少8位', { variant: 'error' }); return;
    }
    if (newPassword !== confirmPassword) {
      enqueueSnackbar('两次输入的新密码不一致', { variant: 'error' }); return;
    }
    if (oldPassword === newPassword) {
      enqueueSnackbar('新密码不能与旧密码相同', { variant: 'error' }); return;
    }
    setLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        enqueueSnackbar('密码修改成功', { variant: 'success' });
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        enqueueSnackbar(res.message || '修改失败', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>修改密码</Typography>
      <Card sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="原密码" type="password" fullWidth margin="normal" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          <TextField label="新密码" type="password" fullWidth margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} helperText="至少8位" />
          <TextField label="确认新密码" type="password" fullWidth margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }} disabled={loading}>
            {loading ? '提交中...' : '确认修改'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
