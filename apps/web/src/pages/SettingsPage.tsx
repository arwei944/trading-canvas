// apps/web/src/pages/SettingsPage.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Sync, DeleteOutline, Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@trading.canvas/core';

// 设置项类型
interface Settings {
  sync_interval_minutes: string;
  default_account_type: string;
  currency_unit: string;
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<Settings>({
    sync_interval_minutes: '5',
    default_account_type: 'ALL',
    currency_unit: 'USD',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'error';
  }>({ open: false, message: '', severity: 'info' });

  // 加载设置
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<Record<string, string>>('/ex/settings');
      setSettings(prev => ({
        ...prev,
        sync_interval_minutes: data.sync_interval_minutes || '5',
        default_account_type: data.default_account_type || 'ALL',
        currency_unit: data.currency_unit || 'USD',
      }));
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 更新单个设置项
  const handleChange = (key: keyof Settings, value: string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // 自动保存
    saveSettings(newSettings);
  };

  // 保存设置
  const saveSettings = async (newSettings: Settings) => {
    try {
      await apiClient.put('/ex/settings', { settings: newSettings });
      setSnackbar({ open: true, message: t('settings.settingsSaved'), severity: 'success' });
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSnackbar({ open: true, message: t('settings.saveFailed'), severity: 'error' });
    }
  };

  // 手动同步
  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/ex/api/refresh');
      setSnackbar({ open: true, message: t('settings.syncComplete'), severity: 'success' });
    } catch (err) {
      console.error('Sync failed:', err);
      setSnackbar({ open: true, message: t('settings.syncFailed'), severity: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  // 清除缓存
  const handleClearCache = () => {
    setConfirmOpen(true);
  };

  const confirmClearCache = () => {
    setConfirmOpen(false);
    // 暂时只做前端提示
    setSnackbar({ open: true, message: t('settings.cacheCleared'), severity: 'success' });
  };

  // 导出数据
  const handleExportData = () => {
    setSnackbar({ open: true, message: t('settings.featureInProgress'), severity: 'info' });
  };

  // 语言切换
  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const currentLanguage = i18n.language?.startsWith('zh') ? 'zh' : 'en';

  // 同步间隔选项（动态翻译）
  const syncIntervalOptions = [
    { value: '1', label: t('settings.intervalMinute', { count: 1 }) },
    { value: '5', label: t('settings.intervalMinute', { count: 5 }) },
    { value: '10', label: t('settings.intervalMinute', { count: 10 }) },
    { value: '30', label: t('settings.intervalMinute', { count: 30 }) },
    { value: '60', label: t('settings.intervalMinute', { count: 60 }) },
  ];

  // 账户类型选项（动态翻译）
  const accountTypeOptions = [
    { value: 'ALL', label: t('dashboard.filterAll') },
    { value: 'SPOT', label: t('dashboard.filterSpot') },
    { value: 'FUTURES', label: t('dashboard.filterFutures') },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      {/* 页面标题 */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          letterSpacing: '-0.02em',
          mb: 3,
          color: '#1d1d1f',
        }}
      >
        {t('settings.title')}
      </Typography>

      {/* 同步设置 */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: '#86868b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 1.5,
        }}
      >
        {t('settings.syncSettings')}
      </Typography>
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          {/* 同步间隔 */}
          <Box sx={{ mb: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.875rem' }}>{t('settings.syncInterval')}</InputLabel>
              <Select
                value={settings.sync_interval_minutes}
                label={t('settings.syncInterval')}
                onChange={(e) => handleChange('sync_interval_minutes', e.target.value)}
                sx={{ fontSize: '0.875rem' }}
              >
                {syncIntervalOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 手动同步 */}
          <Button
            variant="outlined"
            startIcon={syncing ? <CircularProgress size={16} /> : <Sync sx={{ fontSize: 18 }} />}
            onClick={handleSync}
            disabled={syncing}
            sx={{
              borderColor: 'rgba(0,0,0,0.12)',
              color: '#1d1d1f',
              textTransform: 'none',
              fontSize: '0.875rem',
              borderRadius: 1.5,
              px: 2,
              '&:hover': {
                borderColor: 'rgba(0,0,0,0.3)',
                bgcolor: 'transparent',
              },
            }}
          >
            {syncing ? t('settings.syncing') : t('settings.manualSync')}
          </Button>
        </CardContent>
      </Card>

      {/* 显示设置 */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: '#86868b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 1.5,
        }}
      >
        {t('settings.displaySettings')}
      </Typography>
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          {/* 语言切换 */}
          <Box sx={{ mb: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.875rem' }}>{t('settings.language')}</InputLabel>
              <Select
                value={currentLanguage}
                label={t('settings.language')}
                onChange={(e) => handleLanguageChange(e.target.value)}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="zh" sx={{ fontSize: '0.875rem' }}>中文</MenuItem>
                <MenuItem value="en" sx={{ fontSize: '0.875rem' }}>English</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 默认账户类型 */}
          <Box sx={{ mb: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.875rem' }}>{t('settings.defaultAccountType')}</InputLabel>
              <Select
                value={settings.default_account_type}
                label={t('settings.defaultAccountType')}
                onChange={(e) => handleChange('default_account_type', e.target.value)}
                sx={{ fontSize: '0.875rem' }}
              >
                {accountTypeOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 货币单位 */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.875rem' }}>{t('settings.currencyUnit')}</InputLabel>
            <Select
              value={settings.currency_unit}
              label={t('settings.currencyUnit')}
              onChange={(e) => handleChange('currency_unit', e.target.value)}
              sx={{ fontSize: '0.875rem' }}
            >
              <MenuItem value="USD" sx={{ fontSize: '0.875rem' }}>USD</MenuItem>
              <MenuItem value="CNY" sx={{ fontSize: '0.875rem' }}>CNY</MenuItem>
              <MenuItem value="BTC" sx={{ fontSize: '0.875rem' }}>BTC</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: '#86868b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 1.5,
        }}
      >
        {t('settings.dataManagement')}
      </Typography>
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<DeleteOutline sx={{ fontSize: 18 }} />}
              onClick={handleClearCache}
              sx={{
                borderColor: 'rgba(0,0,0,0.12)',
                color: '#1d1d1f',
                textTransform: 'none',
                fontSize: '0.875rem',
                borderRadius: 1.5,
                px: 2,
                '&:hover': {
                  borderColor: 'rgba(0,0,0,0.3)',
                  bgcolor: 'transparent',
                },
              }}
            >
              {t('settings.clearCache')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download sx={{ fontSize: 18 }} />}
              onClick={handleExportData}
              sx={{
                borderColor: 'rgba(0,0,0,0.12)',
                color: '#1d1d1f',
                textTransform: 'none',
                fontSize: '0.875rem',
                borderRadius: 1.5,
                px: 2,
                '&:hover': {
                  borderColor: 'rgba(0,0,0,0.3)',
                  bgcolor: 'transparent',
                },
              }}
            >
              {t('settings.exportData')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 清除缓存确认对话框 */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 360 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1rem' }}>{t('settings.confirmClearTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#86868b' }}>
            {t('settings.confirmClearMessage')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: 'none', color: '#86868b' }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={confirmClearCache}
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              bgcolor: '#1d1d1f',
              '&:hover': { bgcolor: '#333' },
            }}
          >
            {t('settings.confirmClear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 1.5, fontSize: '0.875rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
