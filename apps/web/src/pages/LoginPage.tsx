import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  VisibilityOutlined,
  VisibilityOffOutlined,
  MailOutline,
  LockOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '@trading.canvas/core';

/**
 * macOS 极简风格登录页面
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!email) {
      setValidationError('请输入邮箱');
      return;
    }
    if (!password) {
      setValidationError('请输入密码');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // 错误由store处理
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f7',
        p: 3,
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 400, 
          width: '100%', 
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#1d1d1f',
                letterSpacing: '-0.02em',
              }}
            >
              TradingCanvas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              交易日志管理
            </Typography>
          </Box>

          {/* 错误提示 */}
          {(error || validationError) && (
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ mb: 2, textAlign: 'center' }}
            >
              {error || validationError}
            </Typography>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              placeholder="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutline sx={{ color: '#86868b', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              placeholder="密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: '#86868b', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#86868b' }}
                    >
                      {showPassword ? <VisibilityOffOutlined sx={{ fontSize: 20 }} /> : <VisibilityOutlined sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              {isLoading ? <CircularProgress size={20} color="inherit" /> : '登录'}
            </Button>
          </form>

          {/* 演示账号 */}
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ mt: 3, display: 'block', textAlign: 'center' }}
          >
            演示账号: demo@tradingcanvas.com / demo123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
