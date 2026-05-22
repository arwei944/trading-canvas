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

## [0.3.0] - 2026-05-22

### 新增

**后端**
- 标签 CRUD 路由（4 个端点：列表/添加/更新/删除，含笔记计数）
- 笔记 CRUD 路由（5 个端点：列表/详情/添加/更新/删除，含标签关联）
- 设置 KV 路由（4 个端点：获取全部/获取单个/批量设置/删除）
- API 更新路由（`PUT /api/update`，支持加密更新 name/api_key/secret_key/passphrase）
- 合约余额获取（`fetchBalance({ type: 'swap' })`）
- 资产类型推断（区分 SPOT/FUTURES/MARGIN/EARN/FUNDING）
- 充提统计真实数据（BTC 价格 + 合约未实现 PnL + 首次快照估算）

**前端**
- SettingsPage 设置页面（同步设置/显示设置/数据管理三组）
- Dashboard "表现" Tab（PnL 概览卡片 + 资产趋势图 + 合约持仓详情）
- Dashboard "分析" Tab（资产分布饼图 + 账户类型分布 + 充提统计 + 当前委托）
- AccountTypeChart 内联组件（ECharts 环形图，按账户类型分布）
- Toast 通知组件（ToastProvider + useToast，MUI Snackbar）
- NotesPage 对接真实 API（标签 Chip 多选替代逗号输入）
- TagsPage 对接真实 API（noteCount 字段映射）
- ApiManagerPage 添加 Toast 操作反馈

**核心包**
- NoteTagService（标签 + 笔记完整 CRUD API 服务）
- useNoteStore（Zustand，标签/笔记状态管理）
- ExchangeService.updateExchangeApi（API 更新方法）

### 变更

- TradeTag 类型新增 `noteCount` 可选字段
- Note 类型新增 `tags` 可选字段（关联标签数组）
- getDepositWithdrawStats 改为 async 函数

## [0.4.0] - 2026-05-22

### 新增

**架构重构**
- React Query (TanStack Query) 替代所有 setInterval 轮询（6 个 hooks）
- QueryClientProvider 全局配置（staleTime: 10s, retry: 1, refetchOnWindowFocus: false）
- 5 个骨架屏组件（Card/Table/Chart/Dashboard/List Skeleton）
- 7 个单元测试（crypto 加密/解密、response helpers、store 初始状态、apiClient 配置）
- vitest 测试框架配置

**国际化**
- react-i18next 完整接入，中/英文切换
- SettingsPage 语言切换下拉框
- 7 个页面 + MainLayout 全部使用 t() 调用
- 完整的 zh.json 和 en.json 翻译文件

**文档**
- README.md（功能/技术栈/项目结构/快速开始/支持交易所）

### 变更

- ExchangeService 全部 16 个方法统一为实例方法（移除 static）
- ExchangeAPI/Note/TradeTag 类型统一蛇形命名（与后端一致）
- 前端页面 CircularProgress 替换为骨架屏组件
- 删除未使用的导入，统一 import 顺序

### 移除

- AccountDetailPage（与 Dashboard 功能重叠的冗余页面）

[0.3.0]: https://github.com/arwei944/trading-canvas/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/arwei944/trading-canvas/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/arwei944/trading-canvas/releases/tag/v0.1.0
