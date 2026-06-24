import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider,
} from '@mui/material';
import {
  People, Group, Store, Restaurant, MenuBook, Assignment, Category, Lock, Groups, Bookmarks,
} from '@mui/icons-material';

const menuItems = [
  { name: '管理员列表', path: '/admin', icon: <People /> },
  { name: '用户列表', path: '/users', icon: <Group /> },
  { name: '书籍列表', path: '/books', icon: <MenuBook /> },
  { name: '书籍种类', path: '/book-categories', icon: <Bookmarks /> },
  { name: '餐厅列表', path: '/shops', icon: <Store /> },
  { name: '食物列表', path: '/foods', icon: <Restaurant /> },
  { name: '事务列表', path: '/affairs', icon: <Assignment /> },
  { name: '事务种类', path: '/affair-categories', icon: <Category /> },
  { name: '社团列表', path: '/clubs', icon: <Groups /> },

];

const DRAWER_WIDTH = 240;

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: '#f8f9fc' },
      }}
    >
      <Toolbar>
        <Lock sx={{ mr: 1, color: 'primary.main' }} />
        管理系统
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              mx: 1, borderRadius: 2, mb: 0.5,
              '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : undefined }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <List>
        <ListItemButton
          selected={location.pathname === '/change-password'}
          onClick={() => navigate('/change-password')}
          sx={{
            mx: 1, borderRadius: 2,
            '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } },
          }}
        >
          <ListItemIcon sx={{ color: location.pathname === '/change-password' ? 'white' : undefined }}>
            <Lock />
          </ListItemIcon>
          <ListItemText primary="修改密码" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
