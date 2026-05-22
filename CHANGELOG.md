# Changelog

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本管理遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [0.2.0] - 2026-05-22

### 新增

**后端**
- 搭建 Express 后端服务，模块化架构（adapters / db / services / routes）
- SQLite 数据库初始化，7 张表（exchange_names、exchange_apis、asset_snapshots、trade_tags、trade_notes、note_tags、app_settings）
- 6 家交易所种子数据（Binance、OKX、Bybit、Gate.io、Bitget、HTX）
- AES-256-GCM 加密存储 API Key / Secret Key
- 交易所 API 管理路由（5 个端点：列表/添加/删除/星标/权限检查）
- 数据同步服务（ccxt 对接，13 个数据获取方法）
- 数据查询路由（12 个端点：资产/持仓/委托/日历/价格/趋势图等）
- node-cron 定时同步调度器（可配置间隔）
- `.env.example` 环境变量模板

**前端**
- ErrorBoundary 全局错误边界组件
- Vite 开发代理配置（`/ex` → `localhost:3001`）
- API 管理页面真实数据对接（增删/星标/列表）
- Dashboard 页面真实数据对接（useAssets / usePositions / useOrders）
- Calendar 页面真实数据对接（useCalendar）
- 自定义 Hooks：useAssets、usePositions、useOrders、useCalendar、usePrice、useAssetRatio

**核心包**
- Axios HTTP 客户端封装（统一响应解包 `response.data.data`）
- ExchangeService 类（15 个方法覆盖所有后端端点）
- exchangeStore（Zustand，管理交易所列表/API 增删/星标）
- 完整类型定义（ExchangeAPI、AssetBalance、PositionData、OrderData、CalendarData、TrendData 等）

**文档**
- DEVELOPMENT.md 开发文档（10 章节：概述/架构/技术栈/目录结构/API 设计/数据库设计/页面规范/路线图/任务拆分/验收标准）
- VERSION_CONTROL.md 版本管理规范（9 章节：Git Flow / Conventional Commits / SemVer / CHANGELOG / 发布流程 / 分支命名 / PR Review / 紧急修复 / 工具配置）
- PROGRESS.md 开发进度追踪文档

### 变更

- pnpm workspace 配置更新（添加 `server` 包）
- Vite 路径别名更新（`@trading-canvas` → `@trading.canvas`）
- 日历页面年份改为动态获取当前年份
- 移除硬编码的交易所 ID

### 移除

- LoginPage 登录页面（个人使用，无需认证）
- authStore 认证状态管理

---

## [0.1.0] - 初始版本

### 新增

- React 18 + Vite 5 + MUI 5 + ECharts + TypeScript 前端框架
- pnpm monorepo 架构（apps/web、packages/core、packages/hooks）
- macOS 极简设计风格 UI
- Dashboard 总览页面（模拟数据）
- Calendar 日历页面（模拟数据）
- API 管理页面（模拟数据）
- Notes 笔记页面（模拟数据）
- Tags 标签页面（模拟数据）
- 侧边栏导航布局
- i18n 国际化文件结构（中/英）
- Zustand 状态管理
- React Query 集成（未使用）

[0.2.0]: https://github.com/arwei944/trading-canvas/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/arwei944/trading-canvas/releases/tag/v0.1.0
