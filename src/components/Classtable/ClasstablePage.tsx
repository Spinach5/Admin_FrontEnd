import { useState } from 'react';
import { Box, Card, TextField, Button, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import client from '../../api/client';
import type { ApiResponse } from '../../api/types';

export function ClasstablePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('2025');
  const [semester, setSemester] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      enqueueSnackbar('请填写账号密码', { variant: 'error' }); return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await client.post<ApiResponse>('/classtable', { username, password, year, semester });
      if (res.data.success) {
        setResult(res.data.data);
        enqueueSnackbar('查询成功', { variant: 'success' });
      } else {
        enqueueSnackbar(res.data.message || '查询失败', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('网络错误', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>课表查询</Typography>
      <Card sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleQuery}>
          <TextField label="学号/账号" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField label="密码" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField label="学年" fullWidth margin="normal" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
          <FormControl fullWidth margin="normal">
            <InputLabel>学期</InputLabel>
            <Select value={semester} label="学期" onChange={(e) => setSemester(e.target.value)}>
              <MenuItem value="1">第一学期</MenuItem>
              <MenuItem value="2">第二学期</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '查询课表'}
          </Button>
        </Box>
      </Card>
      {result && (
        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>查询结果</Typography>
          <pre style={{ overflow: 'auto', fontSize: 13 }}>{JSON.stringify(result, null, 2)}</pre>
        </Card>
      )}
    </Box>
  );
}
