import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './components/Auth/LoginPage';

import theme from './theme/theme';

const AdminList = lazy(() => import('./components/Admin/AdminList').then(m => ({ default: m.AdminList })));
const ShopList = lazy(() => import('./components/Shop/ShopList').then(m => ({ default: m.ShopList })));
const FoodList = lazy(() => import('./components/Food/FoodList').then(m => ({ default: m.FoodList })));
const AffairList = lazy(() => import('./components/Affair/AffairList').then(m => ({ default: m.AffairList })));
const AffairCategoryList = lazy(() => import('./components/AffairCategory/AffairCategoryList').then(m => ({ default: m.AffairCategoryList })));
const ChangePasswordPage = lazy(() => import('./components/Auth/ChangePasswordPage').then(m => ({ default: m.ChangePasswordPage })));
const UserList = lazy(() => import('./components/User/UserList').then(m => ({ default: m.UserList })));
const BookList = lazy(() => import('./components/Book/BookList').then(m => ({ default: m.BookList })));
const ClubList = lazy(() => import('./components/Club/ClubList').then(m => ({ default: m.ClubList })));
const BookCategoryList = lazy(() => import('./components/BookCategory/BookCategoryList').then(m => ({ default: m.BookCategoryList })));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
    <CircularProgress />
  </Box>
);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/admin" replace />} />
                  <Route path="admin" element={<AdminList />} />
                  <Route path="shops" element={<ShopList />} />
                  <Route path="foods" element={<FoodList />} />
                  <Route path="affairs" element={<AffairList />} />
                  <Route path="affair-categories" element={<AffairCategoryList />} />
                  <Route path="users" element={<UserList />} />
                  <Route path="books" element={<BookList />} />
                  <Route path="clubs" element={<ClubList />} />
                  <Route path="book-categories" element={<BookCategoryList />} />
                  <Route path="change-password" element={<ChangePasswordPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
