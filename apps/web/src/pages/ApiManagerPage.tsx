import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Star,
  StarBorder,
  Key,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useExchangeStore, exchanges } from '@trading.canvas/core';
import { useToast } from '../components/Toast';
import { ListSkeleton } from '../components/Skeleton';

// 交易所列表
const exchangeOptions = Object.values(exchanges).map(e => ({
  value: e.id,
  label: e.name,
}));

/**
 * API管理页面
 */
export function ApiManagerPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { exchanges, apis, isLoading, addApi, removeApi, toggleStar, fetchExchanges } = useExchangeStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editApi, setEditApi] = useState<typeof apis[0] | null>(null);
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});

  // 页面加载时获取 API 列表
  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  // 表单状态
  const [formData, setFormData] = useState({
    exchangeId: 1,
    name: '',
    apiKey: '',
    secretKey: '',
    passphrase: '',
  });

  const handleOpenDialog = (api?: typeof apis[0]) => {
    if (api) {
      setEditApi(api);
      setFormData({
        exchangeId: api.exchange_id,
        name: api.name,
        apiKey: '',
        secretKey: '',
        passphrase: '',
      });
    } else {
      setEditApi(null);
      setFormData({
        exchangeId: 1,
        name: '',
        apiKey: '',
        secretKey: '',
        passphrase: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditApi(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.apiKey || !formData.secretKey) {
      return;
    }

    try {
      await addApi({
        exchangeId: formData.exchangeId as any,
        name: formData.name,
        apiKey: formData.apiKey,
        secretKey: formData.secretKey,
        passphrase: formData.passphrase || undefined,
      });
      showToast(t('api.apiAdded'), 'success');
      handleCloseDialog();
    } catch (error: any) {
      showToast(t('api.operationFailed') + ': ' + error.message, 'error');
    }
  };

  const handleDelete = async (apiId: number) => {
    if (window.confirm(t('api.confirmDelete'))) {
      try {
        await removeApi(apiId);
        showToast(t('api.apiDeleted'), 'success');
      } catch (error: any) {
        showToast(t('api.operationFailed') + ': ' + error.message, 'error');
      }
    }
  };

  const getExchangeName = (exchangeId: number) => {
    return exchanges[exchangeId]?.name || t('api.unknownExchange');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {t('api.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          {t('api.add')}
        </Button>
      </Box>

      {/* API列表 */}
      {isLoading ? (
        <ListSkeleton />
      ) : (
      <Card>
        <CardContent sx={{ p: 0 }}>
          {apis.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {t('api.noApis')}
              </Typography>
            </Box>
          ) : (
            <List>
              {apis.map((api) => (
                <ListItem
                  key={api.id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {api.name}
                        </Typography>
                        <Chip
                          label={getExchangeName(api.exchange_id)}
                          size="small"
                          variant="outlined"
                        />
                        {api.star === 1 && (
                          <Chip
                            label={t('api.default')}
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('api.apiKey')}: {api.apiKey ? `****${api.apiKey.slice(-4)}` : t('api.apiKeyNotSet')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('api.createdAt')}: {new Date(api.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => toggleStar(api.id)}
                      color={api.star === 1 ? 'warning' : 'default'}
                    >
                      {api.star === 1 ? <Star /> : <StarBorder />}
                    </IconButton>
                    <IconButton onClick={() => handleOpenDialog(api)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(api.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
      )}

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editApi ? t('api.edit') : t('api.add')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label={t('api.exchange')}
                value={formData.exchangeId}
                onChange={(e) => setFormData({ ...formData, exchangeId: Number(e.target.value) })}
              >
                {exchangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('api.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('api.namePlaceholder')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('api.apiKey')}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder={t('api.apiKeyPlaceholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('api.secretKey')}
                type="password"
                value={formData.secretKey}
                onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                placeholder={t('api.secretKeyPlaceholder')}
              />
            </Grid>
            {exchanges[formData.exchangeId]?.name === 'OKX' && ( // OKX需要passphrase
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('api.passphrase')}
                  type="password"
                  value={formData.passphrase}
                  onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                  placeholder={t('api.passphrasePlaceholder')}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.apiKey || !formData.secretKey}
          >
            {editApi ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 安全提示 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" color="warning.main" gutterBottom>
            {t('api.securityTips')}
          </Typography>
          <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{
            __html: t('api.securityTipsContent'),
          }} />
        </CardContent>
      </Card>
    </Box>
  );
}
