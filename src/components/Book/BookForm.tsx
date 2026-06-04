import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, Typography, IconButton } from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { createBook, updateBook, getCategories } from '../../api/books';
import type { Book } from '../../api/types';

interface Props {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookForm({ open, book, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [isbn, setIsbn] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState('active');
  const [categories, setCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDeleted, setImageDeleted] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!book;

  useEffect(() => {
    if (open) {
      getCategories().then(res => { if (res.success) setCategories(res.data || []); });
    }
    if (book) {
      setTitle(book.title);
      setCategory(book.category);
      setPrice(book.price);
      setIsbn(book.isbn);
      setContact(book.contact || '');
      setStatus(book.status);
      setImageFile(null);
      setImageDeleted(false);
      setImagePreview(book.image_url || '');
    } else {
      setTitle('');
      setCategory('');
      setPrice('');
      setIsbn('');
      setContact('');
      setStatus('active');
      setImageFile(null);
      setImageDeleted(false);
      setImagePreview('');
    }
  }, [book, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('请选择图片文件', { variant: 'error' });
      return;
    }
    setImageFile(file);
    setImageDeleted(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImageDeleted(true);
    setImagePreview('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      enqueueSnackbar('书名不能为空', { variant: 'error' });
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('category', category);
    fd.append('price', price);
    fd.append('isbn', isbn);
    fd.append('contact', contact);
    fd.append('status', status);
    if (imageFile) {
      fd.append('image', imageFile);
    } else if (imageDeleted) {
      fd.append('delete_image', 'true');
    }

    try {
      const res = isEdit ? await updateBook(book!.id, fd) : await createBook(fd);
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
      <DialogTitle>{isEdit ? '编辑书籍' : '添加书籍'}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            position: 'relative',
            border: '2px dashed #ccc',
            borderRadius: 2,
            height: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            mt: 1,
            overflow: 'hidden',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          {imagePreview ? (
            <>
              <Box
                component="img"
                src={imagePreview}
                alt="预览"
                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
              <IconButton
                size="small"
                onClick={clearImage}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </>
          ) : (
            <Box
              onClick={() => fileRef.current?.click()}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '100%', height: '100%', justifyContent: 'center' }}
            >
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary">点击上传图片</Typography>
            </Box>
          )}
        </Box>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        <TextField label="书名" required fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
        <FormControl fullWidth margin="normal">
          <InputLabel>分类</InputLabel>
          <Select value={category} label="分类" onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="价格" fullWidth margin="normal" value={price} onChange={(e) => setPrice(e.target.value)} />
        <TextField label="ISBN" fullWidth margin="normal" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        <TextField label="联系方式" fullWidth margin="normal" value={contact} onChange={(e) => setContact(e.target.value)} />
        <FormControl fullWidth margin="normal">
          <InputLabel>状态</InputLabel>
          <Select value={status} label="状态" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="active">在售</MenuItem>
            <MenuItem value="inactive">下架</MenuItem>
          </Select>
        </FormControl>
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
