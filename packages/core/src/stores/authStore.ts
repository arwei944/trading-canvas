// packages/core/src/stores/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';
import { setTokenGetter } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

// 模拟用户数据
const MOCK_USER: User = {
  id: 1,
  username: 'demo',
  email: 'demo@tradingcanvas.com',
  status: 'active',
  from: null,
  lang: 'zh',
  createTime: Date.now(),
  updateTime: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // 设置 token 获取器（避免循环依赖）
      setTokenGetter(() => get().token);

      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            // 模拟登录验证
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 验证演示账号
            if (email === 'demo@tradingcanvas.com' && password === 'demo123') {
              set({
                user: MOCK_USER,
                token: 'mock-jwt-token-' + Date.now(),
                isAuthenticated: true,
                isLoading: false,
              });
            } else if (email && password) {
              // 允许任何非空账号密码登录（演示模式）
              set({
                user: {
                  ...MOCK_USER,
                  email,
                  username: email.split('@')[0],
                },
                token: 'mock-jwt-token-' + Date.now(),
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              throw new Error('邮箱或密码不能为空');
            }
          } catch (error: any) {
            set({
              error: error.message || '登录失败',
              isLoading: false,
            });
            throw error;
          }
        },

        signup: async (username, email, password) => {
          set({ isLoading: true, error: null });
          try {
            // 模拟注册
            await new Promise(resolve => setTimeout(resolve, 500));
            
            set({
              user: {
                ...MOCK_USER,
                username,
                email,
              },
              token: 'mock-jwt-token-' + Date.now(),
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error: any) {
            set({
              error: error.message || '注册失败',
              isLoading: false,
            });
            throw error;
          }
        },

        logout: () => {
          set({ user: null, token: null, isAuthenticated: false });
        },

        fetchUser: async () => {
          if (!get().token) return;
          try {
            // 模拟获取用户信息
            set({ user: MOCK_USER });
          } catch {
            get().logout();
          }
        },

        clearError: () => set({ error: null }),
      };
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
