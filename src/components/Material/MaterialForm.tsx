import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  Autocomplete, Chip, Box, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { createMaterial, updateMaterial, getClasses } from '../../api/materials';
import type { Material, MaterialClass } from '../../api/types';

interface Props {
  open: boolean;
  material: Material | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialForm({ open, material, onClose, onSuccess }: Props) {
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [price, setPrice] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  // 创建时可关联班级/学期
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [classNames, setClassNames] = useState<string[]>([]);
  const [classes, setClasses] = useState<MaterialClass[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!material;

  useEffect(() => {
    if (open) {
      // 加载班级列表用于创建时关联
      getClasses().then((res) => { if (res.success) setClasses(res.data || []); });
    }
  }, [open]);

  useEffect(() => {
    if (material) {
      setIsbn(material.isbn);
      setTitle(material.title);
      setAuthor(material.author || '');
      setPublisher(material.publisher || '');
      setPrice(material.price ? String(material.price) : '');
      setExtraInfo(material.extra_info || '');
    } else {
      setIsbn('');
      setTitle('');
      setAuthor('');
      setPublisher('');
      setPrice('');
      setExtraInfo('');
    }
    setSemester('');
    setAcademicYear('');
    setClassNames([]);
  }, [material, open]);

  const handleSubmit = async () => {
    if (!isbn.trim()) {
      enqueueSnackbar('ISBN 不能为空', { variant: 'error' });
      return;
    }
    if (!title.trim()) {
      enqueueSnackbar('书名不能为空', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const res = await updateMaterial(material!.id, {
          isbn: isbn.trim(),
          title: title.trim(),
          author: author.trim(),
          publisher: publisher.trim(),
          price: price ? parseFloat(price) : 0,
          extra_info: extraInfo.trim(),
        });
        if (res.success) {
          enqueueSnackbar('更新成功', { variant: 'success' });
          onSuccess();
        } else {
          enqueueSnackbar(res.message || '更新失败', { variant: 'error' });
        }
      } else {
        const res = await createMaterial({
          isbn: isbn.trim(),
          title: title.trim(),
          author: author.trim(),
          publisher: publisher.trim(),
          price: price ? parseFloat(price) : 0,
          extra_info: extraInfo.trim(),
          semester: semester.trim() || undefined,
          academic_year: academicYear.trim() || undefined,
          class_names: semester.trim() ? classNames : undefined,
        });
        if (res.success) {
          enqueueSnackbar('添加成功', { variant: 'success' });
          onSuccess();
        } else {
          enqueueSnackbar(res.message || '添加失败', { variant: 'error' });
        }
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '编辑教材' : '添加教材'}</DialogTitle>
      <DialogContent>
        <TextField label="ISBN" required fullWidth margin="normal" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        <TextField label="书名" required fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="作者" fullWidth margin="normal" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <TextField label="出版社" fullWidth margin="normal" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
        <TextField
          label="单价"
          fullWidth
          margin="normal"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
        />
        <TextField
          label="备注信息"
          fullWidth
          margin="normal"
          value={extraInfo}
          onChange={(e) => setExtraInfo(e.target.value)}
          multiline
          rows={2}
        />

        {!isEdit && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              关联班级与学期（可选，填写后创建教材的同时将其关联到指定班级的教材包）
            </Typography>
            <TextField
              label="学期"
              fullWidth
              margin="normal"
              size="small"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="如 2024-2025-1"
            />
            <TextField
              label="学年"
              fullWidth
              margin="normal"
              size="small"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="如 2024-2025"
            />
            <Autocomplete
              multiple
              size="small"
              options={classes.map((c) => c.class_name)}
              value={classNames}
              onChange={(_e, v) => setClassNames(v)}
              renderValue={(value: string[], getItemProps) =>
                value.map((option, index) => {
                  const { key, ...itemProps } = getItemProps({ index });
                  return <Chip key={key} label={option} size="small" {...itemProps} />;
                })
              }
              renderInput={(params) => (
                <TextField {...params} label="关联班级" placeholder="选择班级" margin="normal" />
              )}
              disabled={!semester.trim()}
            />
          </Box>
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
