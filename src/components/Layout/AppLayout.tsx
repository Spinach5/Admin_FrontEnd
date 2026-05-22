import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <TopBar />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '240px', mt: '64px' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
