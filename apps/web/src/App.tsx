import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@trading.canvas/core';
import { MainLayout } from './layouts/MainLayout';
import {
  LoginPage,
  DashboardPage,
  CalendarPage,
  TagsPage,
  NotesPage,
  ApiManagerPage,
} from './pages';
import { useTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// 路由守卫
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const theme = useTheme();

  return (
    <>
      <CssBaseline />
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        
        {/* 受保护路由 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="api" element={<ApiManagerPage />} />
          <Route path="api/add" element={<ApiManagerPage />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
