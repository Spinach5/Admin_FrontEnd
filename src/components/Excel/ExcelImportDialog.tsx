import { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, LinearProgress, Stack, Divider, Chip,
} from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { previewExcel, importExcel } from '../../api/excel';
import type { ExcelPreview } from '../../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  table: string;
  onSuccess: () => void;
}

export function ExcelImportDialog({ open, onClose, table, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ExcelPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const tableLabels: Record<string, string> = { shops: '餐厅', foods: '食物', affairs: '事务' };

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.endsWith('.xlsx')) {
      enqueueSnackbar('请上传 .xlsx 文件', { variant: 'error' }); return;
    }
    setFile(f);
    setLoading(true);
    setPreview(null);
    try {
      const res = await previewExcel(f);
      if (res.success && res.data) {
        setPreview(res.data);
      } else {
        enqueueSnackbar(res.message || '预览失败', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('文件解析失败', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await importExcel(table, file);
      if (res.success) {
        enqueueSnackbar(res.message || '导入成功', { variant: 'success' });
        onSuccess();
        onClose();
      } else {
        enqueueSnackbar(res.message || '导入失败', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('导入失败', { variant: 'error' });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>导入{tableLabels[table] || ''}数据</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%', backgroundColor: 'primary.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontSize: 14, color: 'white', fontWeight: 600 }}>1</Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>上传 Excel 文件</Typography>
            </Box>
            <Box
              sx={{
                border: file ? '2px solid' : '2px dashed',
                borderColor: isDragging ? 'primary.main' : (file ? 'primary.main' : 'divider'),
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragging ? 'rgba(46, 155, 250, 0.1)' : (file ? undefined : 'transparent'),
                '&:hover': { borderColor: 'primary.main', backgroundColor: file ? undefined : 'rgba(46, 155, 250, 0.05)' },
                transition: 'all 0.2s ease',
              }}
              component="label"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
            >
              {file ? (
                <Stack spacing={2}>
                  <CheckCircle sx={{ fontSize: 48, color: 'primary.main', mx: 'auto' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">点击或拖拽更换文件</Typography>
                </Stack>
              ) : (
                <Stack spacing={1}>
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mx: 'auto' }} />
                  <Typography>点击选择或拖拽 .xlsx 文件</Typography>
                  <Typography variant="caption" color="text.secondary">最大 10MB</Typography>
                </Stack>
              )}
              <input type="file" accept=".xlsx" hidden onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }} />
            </Box>
          </Box>

          {loading && <LinearProgress />}

          {preview && (
            <>
              <Divider />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '50%', backgroundColor: 'primary.main',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography sx={{ fontSize: 14, color: 'white', fontWeight: 600 }}>2</Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>数据预览</Typography>
                  </Box>
                  <Chip
                    label={`共 ${preview.total} 行，${preview.headers.length} 列`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {preview.headers.map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 700, backgroundColor: 'background.paper' }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {preview.rows.slice(0, 10).map((row, i) => (
                          <TableRow key={i} hover>
                            {preview.headers.map((h) => (
                              <TableCell key={h}>{row[h] || '-'}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {preview.total > 10 && (
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        仅显示前 10 行，共 {preview.total} 行
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={importing}>取消</Button>
        <Button onClick={handleImport} variant="contained" disabled={!preview || importing} startIcon={importing ? <CircularProgress size={16} /> : undefined}>
          {importing ? '导入中...' : '确认导入'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}