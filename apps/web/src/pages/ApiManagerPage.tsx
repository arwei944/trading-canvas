import React, { useState } from 'react';
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
  Visibility,
  VisibilityOff,
  Key,
} from '@mui/icons-material';
import { useExchangeStore } from '@trading.canvas/core';
import { exchanges } from '@trading.canvas/core';

// 交易所列表
const exchangeOptions = Object.values(exchanges).map(e => ({
  value: e.id,
  label: e.name,
}));

/**
 * API管理页面
 */
export function ApiManagerPage() {
  const { apis, addApi, removeApi, toggleStar } = useExchangeStore();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editApi, setEditApi] = useState<typeof apis[0] | null>(null);
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});

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
        exchangeId: api.exchangeId,
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

    await addApi({
      exchangeId: formData.exchangeId as any,
      name: formData.name,
      apiKey: formData.apiKey,
      secretKey: formData.secretKey,
      passphrase: formData.passphrase,
    });

    handleCloseDialog();
  };

  const handleDelete = async (apiId: number) => {
    if (window.confirm('确定要删除这个API吗？')) {
      await removeApi(apiId);
    }
  };

  const getExchangeName = (exchangeId: number) => {
    return exchanges[exchangeId]?.name || '未知交易所';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          API管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          添加API
        </Button>
      </Box>

      {/* API列表 */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {apis.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                暂无API配置，请点击右上角添加
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
                          label={getExchangeName(api.exchangeId)}
                          size="small"
                          variant="outlined"
                        />
                        {api.star === 1 && (
                          <Chip
                            label="默认"
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          API Key: {api.apiKey ? `****${api.apiKey.slice(-4)}` : '未设置'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          创建时间: {new Date(api.createTime).toLocaleString('zh-CN')}
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

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editApi ? '编辑API' : '添加API'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="交易所"
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
                label="名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：我的Binance账户"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="请输入API Key"
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
                label="Secret Key"
                type="password"
                value={formData.secretKey}
                onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                placeholder="请输入Secret Key"
              />
            </Grid>
            {formData.exchangeId === 2 && ( // OKX需要passphrase
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Passphrase"
                  type="password"
                  value={formData.passphrase}
                  onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                  placeholder="请输入Passphrase"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.apiKey || !formData.secretKey}
          >
            {editApi ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 安全提示 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" color="warning.main" gutterBottom>
            安全提示
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1. 请确保您的API密钥仅具有读取权限，不要提供提现权限。<br/>
            2. 我们不会存储您的Secret Key，仅保存在本地浏览器中。<br/>
            3. 请勿在公共电脑上使用本系统。<br/>
            4. 建议为每个交易所创建单独的API密钥。
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
