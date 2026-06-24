import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, Typography, IconButton } from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { createBook, updateBook, getCategories } from '../../api/books';
import type { Book } from '../../api/types';

const SLOT_COUNT = 3;

interface Props {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookForm({ open, book, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [isbn, setIsbn] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState('active');
  const [categories, setCategories] = useState<string[]>([]);
  // 图片槽位：缓存 File 对象 + 预览 URL + 已有远程 URL
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(Array(SLOT_COUNT).fill(null));
  const [imagePreviews, setImagePreviews] = useState<string[]>(Array(SLOT_COUNT).fill(''));
  const [existingUrls, setExistingUrls] = useState<string[]>(Array(SLOT_COUNT).fill(''));
  const [loading, setLoading] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!book;

  useEffect(() => {
    if (open) {
      getCategories().then(res => { if (res.success) setCategories(res.data || []); });
    }
    if (book) {
      setTitle(book.title);
      setAuthor(book.author || '');
      setPublisher(book.publisher || '');
      setCategory(book.category);
      setPrice(book.price);
      setIsbn(book.isbn);
      setContact(book.contact || '');
      setDescription(book.description || '');
      setCondition(book.condition || '');
      setStatus(book.status);
      const urls: string[] = Array(SLOT_COUNT).fill('');
      const previews: string[] = Array(SLOT_COUNT).fill('');
      const existingImages = book.images && book.images.length > 0
        ? book.images.map((img) => img.url)
        : book.image_url ? [book.image_url] : [];
      existingImages.forEach((url, i) => {
        if (i < SLOT_COUNT) { urls[i] = url; previews[i] = url; }
      });
      setExistingUrls(urls);
      setImageFiles(Array(SLOT_COUNT).fill(null));
      setImagePreviews(previews);
    } else {
      setTitle('');
      setAuthor('');
      setPublisher('');
      setCategory('');
      setPrice('');
      setIsbn('');
      setContact('');
      setDescription('');
      setCondition('');
      setStatus('active');
      setExistingUrls(Array(SLOT_COUNT).fill(''));
      setImageFiles(Array(SLOT_COUNT).fill(null));
      setImagePreviews(Array(SLOT_COUNT).fill(''));
    }
  }, [book, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('请选择图片文件', { variant: 'error' });
      return;
    }

    const slot = activeSlot;
    // 缓存文件，创建本地预览
    const newFiles = [...imageFiles];
    newFiles[slot] = file;
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews[slot] = URL.createObjectURL(file);
    setImagePreviews(newPreviews);

    // 重置 input 以便重复选同一文件
    if (fileRef.current) fileRef.current.value = '';
  };

  const clearSlot = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    const newUrls = [...existingUrls];
    newFiles[index] = null;
    newPreviews[index] = '';
    newUrls[index] = '';
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    setExistingUrls(newUrls);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      enqueueSnackbar('书名不能为空', { variant: 'error' });
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('author', author.trim());
    fd.append('publisher', publisher.trim());
    fd.append('category', category);
    fd.append('price', price);
    fd.append('isbn', isbn);
    fd.append('contact', contact);
    fd.append('description', description);
    fd.append('condition', condition);
    fd.append('status', status);
    // 图片：有文件则发文件，有已有URL则发URL，都没有则发 delete_image
    const validFiles = imageFiles.filter((f) => f !== null);
    const validUrls = existingUrls.filter((u) => u);
    if (validFiles.length > 0) {
      fd.append('image', validFiles[0]);
    } else if (validUrls.length > 0) {
      fd.append('image_url', validUrls[0]);
    } else {
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
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '网络错误', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '编辑书籍' : '添加书籍'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
          书籍图片（最多{SLOT_COUNT}张）
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          {Array.from({ length: SLOT_COUNT }).map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'relative',
                flex: 1,
                aspectRatio: '1 / 1',
                border: '2px dashed #ccc',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main' },
              }}
              onClick={() => { setActiveSlot(i); fileRef.current?.click(); }}
            >
              {imagePreviews[i] ? (
                <>
                  <Box
                    component="img"
                    src={imagePreviews[i]}
                    alt={`图片${i + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); clearSlot(i); }}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CloudUpload sx={{ fontSize: 28, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    图片{i + 1}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        <TextField label="书名" required fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="作者" fullWidth margin="normal" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <TextField label="出版社" fullWidth margin="normal" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
        <FormControl fullWidth margin="normal">
          <InputLabel>分类</InputLabel>
          <Select value={category} label="分类" onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="价格" fullWidth margin="normal" value={price} onChange={(e) => setPrice(e.target.value)} />
        <TextField label="ISBN" fullWidth margin="normal" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        <TextField label="联系方式" fullWidth margin="normal" value={contact} onChange={(e) => setContact(e.target.value)} />
        <TextField label="描述" fullWidth margin="normal" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} />
        <TextField label="成色" fullWidth margin="normal" value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="例如：几乎全新、九成新" />
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
