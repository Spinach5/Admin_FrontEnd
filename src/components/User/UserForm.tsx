import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createUser, updateUser } from '../../api/users';
import type { NormalUser } from '../../api/types';

interface Props {
  open: boolean;
  user: NormalUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserForm({ open, user, onClose, onSuccess }: Props) {
  const [stuId, setStuId] = useState('');
  const [nickName, setNickName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      setStuId(user.stuId);
      setNickName(user.nickName);
      setSchoolId(user.schoolId);
    } else {
      setStuId('');
      setNickName('');
      setSchoolId('');
    }
  }, [user, open]);

  const handleSubmit = async () => {
    if (!stuId.trim()) {
      enqueueSnackbar('学号不能为空', { variant: 'error' });
      return;
    }
    if (!nickName.trim()) {
      enqueueSnackbar('昵称不能为空', { variant: 'error' });
      return;
    }

    setLoading(true);
    const data = { stuId: stuId.trim(), nickName: nickName.trim(), schoolId: schoolId.trim() };
    try {
      const res = isEdit ? await updateUser(user!.id, data) : await createUser(data);
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
        <TextField
          label="学号"
          fullWidth
          margin="normal"
          value={stuId}
          onChange={(e) => setStuId(e.target.value)}
        />
        <TextField
          label="昵称"
          fullWidth
          margin="normal"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
        />
        <TextField
          label="学校ID"
          fullWidth
          margin="normal"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
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
