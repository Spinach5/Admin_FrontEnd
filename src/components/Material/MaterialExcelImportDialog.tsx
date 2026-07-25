import { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, LinearProgress, TextField,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { previewMaterialsExcel, importMaterialsExcel } from '../../api/materials';
import type { ExcelPreview } from '../../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialExcelImportDialog({ open, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ExcelPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.endsWith('.xlsx')) {
      enqueueSnackbar('请上传 .xlsx 文件', { variant: 'error' });
      return;
    }
    setFile(f);
    setLoading(true);
    setPreview(null);
    try {
      const res = await previewMaterialsExcel(f);
      if (res.success && res.data) {
        setPreview(res.data);
      } else {
        enqueueSnackbar(res.message || '预览失败', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '文件解析失败', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const handleImport = async () => {
    if (!file) return;
    if (!semester.trim()) {
      enqueueSnackbar('请填写学期', { variant: 'error' });
      return;
    }
    setImporting(true);
    try {
      const res = await importMaterialsExcel(file, semester.trim(), academicYear.trim() || undefined);
      if (res.success) {
        enqueueSnackbar(res.message || '导入成功', { variant: 'success' });
        onSuccess();
        handleClose();
      } else {
        enqueueSnackbar(res.message || '导入失败', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || '导入失败', { variant: 'error' });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setSemester('');
    setAcademicYear('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>导入教材数据</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
          <TextField
            label="学期（必填）"
            size="small"
            required
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="如 2024-2025-1"
            sx={{ flex: 1 }}
          />
          <TextField
            label="学年（选填）"
            size="small"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="如 2024-2025"
            sx={{ flex: 1 }}
          />
        </Box>
        <Box
          sx={{
            border: '2px dashed #ccc', borderRadius: 2, p: 4, textAlign: 'center', mb: 2,
            cursor: 'pointer', '&:hover': { borderColor: 'primary.main' },
          }}
          component="label"
        >
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography>点击选择或拖拽 .xlsx 文件</Typography>
          <Typography variant="caption" color="text.secondary">
            表头需含：课程名称、标准书号、教材名称、出版社、作者、估定价、班级信息、院系、备注
          </Typography>
          <input type="file" accept=".xlsx" hidden onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }} />
        </Box>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {preview && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              预览: 共 {preview.total} 行，{preview.headers.length} 列
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {preview.headers.map((h) => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.rows.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      {preview.headers.map((h) => <TableCell key={h}>{row[h]}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {preview.total > 10 && (
              <Typography variant="caption" color="text.secondary">
                仅显示前 10 行，共 {preview.total} 行
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={importing}>取消</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!preview || importing || !semester.trim()}
          startIcon={importing ? <CircularProgress size={16} /> : undefined}
        >
          {importing ? '导入中...' : '确认导入'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
