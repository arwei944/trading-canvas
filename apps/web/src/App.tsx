import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import {
  DashboardPage,
  CalendarPage,
  TagsPage,
  NotesPage,
  ApiManagerPage,
  SettingsPage,
} from './pages';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { useTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

export default function App() {
  const theme = useTheme();

  return (
    <>
      <CssBaseline />
      <ErrorBoundary>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="api" element={<ApiManagerPage />} />
              <Route path="api/add" element={<ApiManagerPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </ErrorBoundary>
    </>
  );
}
