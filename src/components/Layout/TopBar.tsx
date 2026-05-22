import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { logout as apiLogout } from '../../api/auth';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch { /* ignore */ }
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>后台管理系统</Typography>
          <Typography variant="body1" sx={{ ml: 2 }}>
            当前账户: {user?.account}
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={() => setConfirmOpen(true)}>
            注销
          </Button>
        </Toolbar>
      </AppBar>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>确认注销</DialogTitle>
        <DialogContent>
          <DialogContentText>确定要退出登录吗？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>取消</Button>
          <Button onClick={handleLogout} color="error" variant="contained">确认注销</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
