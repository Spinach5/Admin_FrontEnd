import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './components/Auth/LoginPage';
import { ChangePasswordPage } from './components/Auth/ChangePasswordPage';
import { AdminList } from './components/Admin/AdminList';
import { ShopList } from './components/Shop/ShopList';
import { FoodList } from './components/Food/FoodList';
import { AffairList } from './components/Affair/AffairList';
import { AffairCategoryList } from './components/AffairCategory/AffairCategoryList';

import theme from './theme/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin" replace />} />
                <Route path="admin" element={<AdminList />} />
                <Route path="shops" element={<ShopList />} />
                <Route path="foods" element={<FoodList />} />
                <Route path="affairs" element={<AffairList />} />
                <Route path="affair-categories" element={<AffairCategoryList />} />
                <Route path="change-password" element={<ChangePasswordPage />} />

              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
