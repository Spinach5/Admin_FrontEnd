import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createClub, updateClub, getClubCategories } from '../../api/clubs';
import { getUsers } from '../../api/users';
import type { Club, NormalUser } from '../../api/types';

interface Props { open: boolean; club: Club | null; onClose: () => void; onSuccess: () => void; }

export function ClubForm({ open, club, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [activities, setActivities] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [nature, setNature] = useState('');
  const [contact, setContact] = useState('');
  const [principalId, setPrincipalId] = useState('');
  const [users, setUsers] = useState<NormalUser[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!club;

  useEffect(() => {
    if (open) {
      getUsers().then(res => { if (res.success) setUsers(res.data || []); });
      getClubCategories().then(res => { if (res.success) setCategories(res.data || []); });
    }
  }, [open]);

  useEffect(() => {
    if (club) {
      setName(club.name);
      setIntroduction(club.introduction);
      setActivities(club.activities);
      setCategory(club.category);
      setImageUrl(club.image_url);
      setSchoolId(club.schoolId);
      setNature(String(club.nature));
      setContact(club.contact);
      setPrincipalId(club.principal_id ? String(club.principal_id) : '');
    } else {
      setName(''); setIntroduction(''); setActivities(''); setCategory('');
      setImageUrl(''); setSchoolId(''); setNature(''); setContact(''); setPrincipalId('');
    }
  }, [club, open]);

  const handleSubmit = async () => {
    if (!name) { enqueueSnackbar('请填写社团名称', { variant: 'error' }); return; }
    setLoading(true);
    const data = {
      name,
      introduction,
      activities,
      category,
      image_url: imageUrl,
      schoolId,
      nature: parseInt(nature) || 0,
      contact,
      principal_id: principalId ? parseInt(principalId) : undefined,
    };
    try {
      const res = isEdit ? await updateClub(club!.id, data) : await createClub(data);
      if (res.success) { enqueueSnackbar(isEdit ? '更新成功' : '添加成功', { variant: 'success' }); onSuccess(); }
      else enqueueSnackbar(res.message || '操作失败', { variant: 'error' });
    } catch { enqueueSnackbar('网络错误', { variant: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '编辑社团' : '添加社团'}</DialogTitle>
      <DialogContent>
        <TextField label="社团名称" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField label="社团简介" fullWidth margin="normal" value={introduction} onChange={(e) => setIntroduction(e.target.value)} multiline rows={2} />
        <TextField label="社团活动" fullWidth margin="normal" value={activities} onChange={(e) => setActivities(e.target.value)} multiline rows={2} />
        <TextField label="社团类别" select fullWidth margin="normal" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField label="学校id" fullWidth margin="normal" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} />
        <TextField label="图片链接" fullWidth margin="normal" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <TextField label="社团性质" select fullWidth margin="normal" value={nature} onChange={(e) => setNature(e.target.value)}>
          <MenuItem value="0">社团</MenuItem>
          <MenuItem value="1">学生会</MenuItem>
          <MenuItem value="2">其他</MenuItem>
        </TextField>
        <TextField label="负责人" select fullWidth margin="normal" value={principalId} onChange={(e) => setPrincipalId(e.target.value)}>
          <MenuItem value="">无</MenuItem>
          {users.map((u) => <MenuItem key={u.id} value={String(u.id)}>{u.nickName} ({u.stuId})</MenuItem>)}
        </TextField>
        <TextField label="联系方式" fullWidth margin="normal" value={contact} onChange={(e) => setContact(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>取消</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{loading ? '提交中...' : '确认'}</Button>
      </DialogActions>
    </Dialog>
  );
}
