import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  PieChartOutlined,
  CalendarTodayOutlined,
  LabelOutlined,
  EditNoteOutlined,
  SettingsOutlined,
  Settings,
  Add,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const DRAWER_WIDTH = 220;

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
}

const navItemsConfig: NavItem[] = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: <PieChartOutlined sx={{ fontSize: 20 }} /> },
  { path: '/calendar', labelKey: 'nav.calendar', icon: <CalendarTodayOutlined sx={{ fontSize: 20 }} /> },
  { path: '/tags', labelKey: 'nav.tags', icon: <LabelOutlined sx={{ fontSize: 20 }} /> },
  { path: '/notes', labelKey: 'nav.notes', icon: <EditNoteOutlined sx={{ fontSize: 20 }} /> },
  { path: '/api', labelKey: 'nav.api', icon: <SettingsOutlined sx={{ fontSize: 20 }} /> },
  { path: '/settings', labelKey: 'nav.settings', icon: <Settings sx={{ fontSize: 20 }} /> },
];

/**
 * macOS 极简风格主布局
 */
export function MainLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo区域 */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#1d1d1f',
            fontSize: '1.125rem'
          }}
        >
          TradingCanvas
        </Typography>
      </Box>

      {/* 导航菜单 */}
      <List sx={{ px: 1.5, flex: 1 }}>
        {navItemsConfig.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                py: 1,
                px: 1.5,
                minHeight: 40,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: '#86868b' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={t(item.labelKey)}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* 底部操作 */}
      <List sx={{ px: 1.5, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/api/add')}
            sx={{
              borderRadius: 2,
              py: 1,
              px: 1.5,
              minHeight: 40,
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: '#007aff' }}>
              <Add sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary={t('nav.addApi')}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#007aff',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 移动端菜单按钮 */}
      {isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 12,
            left: 12,
            zIndex: 1200,
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,1)',
            },
          }}
        >
          <MenuIcon sx={{ color: '#555555' }} />
        </IconButton>
      )}

      {/* 侧边栏 */}
      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        {/* 移动端抽屉 */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* 桌面端固定侧边栏 */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
              boxShadow: '1px 0 0 rgba(0,0,0,0.06)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* 主内容区 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          pt: { xs: 6, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: '#f5f5f7',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
