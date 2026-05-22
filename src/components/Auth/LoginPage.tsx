import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, TextField, Button, Typography, Alert, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { login as apiLogin } from '../../api/auth';

export function LoginPage() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.trim() || !password.trim()) {
      setError('账号密码不能为空');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiLogin(account, password);
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        navigate('/', { replace: true });
      } else {
        setError(res.message || '登录失败');
      }
    } catch {
      setError('网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <Card sx={{ p: 4, width: 400, maxWidth: '90vw' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
          后台管理系统
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="账号" fullWidth margin="normal" value={account}
            onChange={(e) => setAccount(e.target.value)} disabled={loading}
          />
          <TextField
            label="密码" fullWidth margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="submit" variant="contained" fullWidth size="large"
            sx={{ mt: 3 }} disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
