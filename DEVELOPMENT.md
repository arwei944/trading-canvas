# TradingCanvas 开发文档

> 版本：v1.1.0-draft | 更新日期：2026-05-23
> 定位：个人使用的 macOS 极简加密货币交易日志平台

---

## 目录

1. [项目概述](#1-项目概述)
2. [架构设计](#2-架构设计)
3. [技术栈详情](#3-技术栈详情)
4. [目录结构](#4-目录结构)
5. [后端 API 设计](#5-后端-api-设计)
6. [数据库设计](#6-数据库设计)
7. [前端页面规范](#7-前端页面规范)
8. [版本路线图](#8-版本路线图)
9. [各版本详细任务拆分](#9-各版本详细任务拆分)
10. [验收标准](#10-验收标准)

---

## 1. 项目概述

### 1.1 产品定位

TradingCanvas 是一个**个人专属**的加密货币交易日志管理平台，采用 macOS 极简设计风格。核心价值：

- **统一视图**：聚合多个交易所的资产、持仓、委托数据
- **盈亏追踪**：日历热力图直观展示每日/周/月盈亏
- **交易笔记**：记录交易思路，关联标签分类
- **极简体验**：macOS 风格 UI，专注数据本身

### 1.2 核心功能模块

| 模块 | 功能 | 状态 |
|------|------|------|
| 📊 仪表盘 | 总资产/充提/盈亏汇总、资产趋势图、资产分布饼图、资产/持仓/委托表格 | ✅ 已完成 |
| 📅 盈亏日历 | 热力图 + 柱状图、周/月/年切换、统计卡片 | ✅ 已完成 |
| 🔑 API 管理 | 添加/删除/更新交易所 API、星标默认、权限检查 | ✅ 已完成 |
| 🏷️ 标签管理 | CRUD、颜色选择、笔记计数 | ✅ 已完成 |
| 📝 交易笔记 | CRUD、标签关联、关键词搜索 | ✅ 已完成 |
| 📈 表现分析 | PnL 概览卡片 + 资产趋势图 + 合约持仓详情 | ✅ 已完成 |
| 📉 交易分析 | 资产分布饼图 + 账户类型分布 + 充提统计 + 当前委托 | ✅ 已完成 |
| ⚙️ 设置 | 同步设置/显示设置/数据管理、语言切换 | ✅ 已完成 |
| 📜 历史委托 | 历史委托查询（ccxt fetchMyTrades） | ✅ 已完成 |
| 🔄 同步日志 | 同步状态持久化、同步历史查询 | ✅ 已完成 |
| 🌙 暗色主题 | MUI dark mode 全套适配 | ❌ 待开发 (v1.1.0) |
| 📤 数据导出/导入 | JSON/CSV 导出、数据导入 | ❌ 待开发 (v1.1.0) |
| 📱 移动端适配 | 响应式布局、底部导航 | ❌ 待开发 (v1.2.0) |
| ⚡ WebSocket | 实时价格/持仓推送 | ❌ 待开发 (v1.2.0) |
| 📲 PWA | 离线缓存、安装提示 | ❌ 待开发 (v1.2.0) |

### 1.3 设计原则

- **个人工具**：无需注册/登录/多用户，打开即用
- **数据本地优先**：敏感数据（API Key）本地存储，后端仅做交易所 API 代理
- **macOS 极简风格**：浅色背景 (#f5f5f7)、灰色图标 (#86868b)、圆角设计、极简阴影
- **渐进增强**：先跑通核心流程，再逐步完善
- **安全优先**：AES-256-GCM 加密存储、helmet 安全头、CORS 配置

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    前端 (React SPA)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Dashboard│ │ Calendar │ │  Notes   │ │  API   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       └────────────┴────────────┴───────────┘       │
│                    │                                 │
│  ┌─────────────────┴──────────────────────────┐     │
│  │         @trading.canvas/hooks               │     │
│  │   (React Query / Custom Hooks 数据层)       │     │
│  └─────────────────┬──────────────────────────┘     │
│                    │                                 │
│  ┌─────────────────┴──────────────────────────┐     │
│  │         @trading.canvas/core                │     │
│  │   (Types / Stores / Services)               │     │
│  └─────────────────┬──────────────────────────┘     │
└────────────────────┼────────────────────────────────┘
                     │ HTTP (REST API)
┌────────────────────┼────────────────────────────────┐
│                    ▼                                 │
│              后端服务 (Node.js)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐     │
│  │ API 路由  │ │ 交易所   │ │  数据存储         │     │
│  │          │ │ 适配器   │ │  (SQLite)         │     │
│  └──────────┘ └──────────┘ └──────────────────┘     │
│                    │                                 │
│         ┌──────────┴──────────┐                      │
│         │   各交易所 API       │                      │
│  ┌──────┴──┐ ┌──────┴──┐ ┌───┴────┐               │
│  │ Binance │ │  OKX    │ │ Bybit  │ ...            │
│  └─────────┘ └─────────┘ └────────┘               │
└─────────────────────────────────────────────────────┘
```

### 2.2 Monorepo 包结构

```
trading-canvas/
├── apps/
│   └── web/                    # Web 前端应用
│       ├── src/
│       │   ├── components/     # 通用组件 (9 个)
│       │   ├── layouts/        # 布局组件 (MainLayout)
│       │   ├── locales/        # 国际化 (zh.json, en.json)
│       │   ├── pages/          # 页面组件 (6 个)
│       │   └── theme/          # 主题配置
│       └── package.json
├── packages/
│   ├── core/                   # 核心包
│   │   └── src/
│   │       ├── services/       # API 服务层 (api, exchange, note)
│   │       ├── stores/         # Zustand 状态管理 (exchange, note)
│   │       └── types/          # TypeScript 类型定义
│   └── hooks/                  # 自定义 Hooks
│       └── src/                # 数据获取 Hooks (5 个)
├── server/                     # 后端服务
│   └── src/
│       ├── adapters/           # 交易所适配器 (ccxt)
│       ├── db/                 # SQLite 数据库
│       ├── routes/             # API 路由 (5 个模块)
│       ├── services/           # 业务逻辑 (7 个服务)
│       ├── utils/              # 工具函数 (crypto, response)
│       ├── middleware/         # 中间件 (errorHandler)
│       ├── types.ts            # 后端类型定义
│       ├── app.ts              # Express 应用配置
│       └── index.ts            # 入口文件
├── .github/workflows/          # CI/CD (ci.yml, release.yml)
├── Dockerfile                  # Docker 多阶段构建
├── docker-compose.yml          # Docker Compose
├── pnpm-workspace.yaml
└── package.json
```

### 2.3 数据流

```
用户操作 → 页面组件 → Hooks (React Query) → Core Services → 后端 API → 交易所
                ↑                                              │
                └──────── Zustand Store (全局状态) ←───────────┘
```

### 2.4 后端模块架构

```
server/src/
├── adapters/          # 交易所适配层
│   └── exchangeAdapter.ts    # ccxt 统一封装
├── db/                # 数据访问层
│   └── index.ts              # SQLite 初始化 + 8 张表
├── services/          # 业务逻辑层
│   ├── exchangeService.ts    # 交易所 API 管理
│   ├── dataSyncService.ts    # 数据同步（13 个 ccxt 方法）
│   ├── syncScheduler.ts      # 定时同步调度（node-cron）
│   ├── syncLogService.ts     # 同步日志持久化
│   ├── tagService.ts         # 标签 CRUD
│   ├── noteService.ts        # 笔记 CRUD + 标签关联
│   └── settingsService.ts    # 设置 KV 管理
├── routes/            # 路由层
│   ├── exchangeRoutes.ts     # 交易所 API 管理路由
│   ├── dataRoutes.ts         # 行情/资产/持仓/委托/统计
│   ├── tagRoutes.ts          # 标签路由
│   ├── noteRoutes.ts         # 笔记路由
│   └── settingsRoutes.ts     # 设置路由
├── utils/             # 工具层
│   ├── crypto.ts             # AES-256-GCM 加密/解密
│   └── response.ts           # 统一响应格式
├── middleware/        # 中间件
│   └── errorHandler.ts       # 全局错误处理
├── types.ts           # 后端类型定义
├── app.ts             # Express 应用（helmet/compression/cors）
└── index.ts           # 入口（错误处理 + 启动）
```

---

## 3. 技术栈详情

### 3.1 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.2.0 | UI 框架 |
| TypeScript | ^5.4.0 | 类型安全 |
| Vite | ^5.0.12 | 构建工具 |
| MUI (Material UI) | ^5.15.6 | 组件库 |
| ECharts | ^5.5.0 | 图表（趋势图/饼图/日历热力图） |
| Zustand | ^4.5.0 | 轻量状态管理 |
| React Query | ^5.18.1 | 服务端状态管理 |
| React Router DOM | ^6.21.3 | 路由 |
| react-i18next | ^14.x | 国际化（中/英完整覆盖） |
| Axios | ^1.6.7 | HTTP 客户端 |
| date-fns | ^4.2.1 | 日期处理 |

### 3.2 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | ^4.x | HTTP 服务 |
| better-sqlite3 | ^11.x | SQLite 数据库 |
| ccxt | ^4.x | 统一交易所 API 接口 |
| dotenv | ^16.x | 环境变量管理 |
| node-cron | ^3.x | 定时数据同步 |
| helmet | ^7.x | HTTP 安全头 |
| compression | ^1.x | gzip 响应压缩 |
| cors | ^2.x | 跨域配置 |

### 3.3 DevOps

| 技术 | 用途 |
|------|------|
| Docker | 多阶段构建 + docker-compose 部署 |
| GitHub Actions | CI（测试/构建/lint）+ Release（自动发布） |
| Node.js 18/20 | CI 矩阵测试 |

### 3.4 开发工具

| 工具 | 用途 |
|------|------|
| pnpm | 包管理器 |
| Vitest | 单元测试（21 个用例，6 个测试文件） |
| TypeScript | 类型检查 |

---

## 4. 目录结构（当前状态）

```
trading-canvas/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── components/          # 通用 UI 组件 (9 个)
│       │   │   ├── SummaryCard.tsx      # 汇总卡片
│       │   │   ├── TrendChart.tsx       # 趋势图
│       │   │   ├── AssetTable.tsx       # 资产表格
│       │   │   ├── PositionTable.tsx    # 持仓表格
│       │   │   ├── OrderTable.tsx       # 委托表格
│       │   │   ├── AllocationPie.tsx    # 资产分布饼图
│       │   │   ├── Skeleton.tsx         # 加载骨架屏 (5 种)
│       │   │   ├── ErrorBoundary.tsx    # 错误边界
│       │   │   ├── Toast.tsx            # 提示通知
│       │   │   └── index.ts
│       │   ├── layouts/
│       │   │   └── MainLayout.tsx       # 侧边栏 + 内容区布局
│       │   ├── locales/
│       │   │   ├── en.json              # 英文翻译 (~130 keys)
│       │   │   ├── zh.json              # 中文翻译 (~130 keys)
│       │   │   └── index.ts
│       │   ├── pages/
│       │   │   ├── DashboardPage.tsx    # 仪表盘 (总览/表现/分析 3 Tab)
│       │   │   ├── CalendarPage.tsx      # 盈亏日历
│       │   │   ├── TagsPage.tsx          # 标签管理
│       │   │   ├── NotesPage.tsx         # 交易笔记
│       │   │   ├── ApiManagerPage.tsx    # API 管理
│       │   │   ├── SettingsPage.tsx      # 设置页面
│       │   │   └── index.ts
│       │   ├── theme/
│       │   │   └── index.ts             # macOS 极简主题 (light mode)
│       │   ├── App.tsx                  # 路由 + Provider 配置
│       │   └── main.tsx                 # 入口
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages/
│   ├── core/
│   │   └── src/
│   │       ├── services/
│   │       │   ├── api.ts              # HTTP 客户端 (Axios 封装)
│   │       │   ├── exchange.ts         # 交易所服务 (16 个方法)
│   │       │   ├── note.ts             # 笔记标签服务
│   │       │   └── index.ts
│   │       ├── stores/
│   │       │   ├── exchangeStore.ts    # 交易所状态 (Zustand)
│   │       │   ├── noteStore.ts        # 笔记状态 (Zustand)
│   │       │   └── index.ts
│   │       ├── types/
│   │       │   └── index.ts            # 完整类型定义
│   │       └── index.ts
│   └── hooks/
│       └── src/
│           ├── useAssets.ts            # 资产数据 (React Query)
│           ├── usePositions.ts         # 持仓数据 (React Query)
│           ├── useOrders.ts            # 委托数据 (React Query)
│           ├── useCalendar.ts          # 日历数据 (React Query)
│           ├── usePrice.ts             # 价格数据 (React Query)
│           └── index.ts
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── exchangeRoutes.ts       # 交易所 API 管理 (7 个端点)
│   │   │   ├── dataRoutes.ts           # 行情/资产/持仓/委托/统计 (12 个端点)
│   │   │   ├── tagRoutes.ts            # 标签 CRUD (4 个端点)
│   │   │   ├── noteRoutes.ts           # 笔记 CRUD (5 个端点)
│   │   │   └── settingsRoutes.ts       # 设置管理 (4 个端点)
│   │   ├── services/
│   │   │   ├── exchangeService.ts      # 交易所 API 管理逻辑
│   │   │   ├── dataSyncService.ts      # 数据同步 (13 个 ccxt 方法)
│   │   │   ├── syncScheduler.ts        # 定时同步调度
│   │   │   ├── syncLogService.ts       # 同步日志持久化
│   │   │   ├── tagService.ts           # 标签 CRUD
│   │   │   ├── noteService.ts          # 笔记 CRUD + 标签关联
│   │   │   └── settingsService.ts      # 设置 KV 管理
│   │   ├── adapters/
│   │   │   └── exchangeAdapter.ts      # ccxt 交易所适配器
│   │   ├── db/
│   │   │   └── index.ts                # SQLite 初始化 (8 张表)
│   │   ├── utils/
│   │   │   ├── crypto.ts               # AES-256-GCM 加密/解密
│   │   │   └── response.ts             # 统一响应格式
│   │   ├── middleware/
│   │   │   └── errorHandler.ts         # 全局错误处理
│   │   ├── __tests__/                  # 测试文件
│   │   │   ├── tagService.test.ts
│   │   │   ├── routes.test.ts
│   │   │   └── exchangeService.test.ts
│   │   ├── types.ts                    # 后端类型定义
│   │   ├── app.ts                      # Express 应用配置
│   │   └── index.ts                    # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── .github/workflows/
│   ├── ci.yml                          # CI 工作流
│   └── release.yml                     # Release 工作流
├── Dockerfile                          # 多阶段 Docker 构建
├── docker-compose.yml                  # Docker Compose
├── .dockerignore
├── .env.example                        # 开发环境变量模板
├── .env.production.example             # 生产环境变量模板
├── .gitignore
├── CHANGELOG.md
├── DEVELOPMENT.md                      # 本文档
├── VERSION_CONTROL.md                  # 版本管理规范
├── PROGRESS.md                         # 开发进度追踪
├── README.md                           # 项目说明
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── vitest.config.ts                    # 测试配置
```

---

## 5. 后端 API 设计

### 5.1 统一响应格式

```typescript
interface ApiResponse<T> {
  code: string;      // "0" = 成功, 其他 = 错误码
  msg: string;       // 消息描述
  data: T;           // 数据载荷
  success: boolean;  // 是否成功
}
```

### 5.2 API 端点清单

#### 交易所 API 管理

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/ex/api/ex_list` | - | `ExchangeInfo[]` | 获取所有交易所及 API 列表 |
| POST | `/ex/api/add` | `{ exchangeId, name, apiKey, secretKey, passphrase? }` | `ExchangeAPI` | 添加交易所 API |
| DELETE | `/ex/api/delete` | `{ apiId }` | `void` | 删除 API |
| PUT | `/ex/api/star` | `{ apiId }` | `void` | 切换星标 |
| PUT | `/ex/api/update` | `{ apiId, name?, apiKey?, secretKey?, passphrase? }` | `ExchangeAPI` | 更新 API 信息 |
| GET | `/ex/api/checkApiIdPermissions` | `?apiId=` | `boolean` | 检查 API 权限 |
| GET | `/ex/api/refresh` | `?apiId=` | `{ state, ratio }` | 触发数据同步 |
| GET | `/ex/api/refresh/state` | `?apiId=` | `{ state, ratio }` | 查询同步状态 |

#### 行情数据

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/ex/price/getBTCAndETHPrice` | - | `{ btcPrice, ethPrice }` | BTC/ETH 实时价格 |

#### 资产数据

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/ex/asset/account/balance/v2` | `?apiId=&pageSize=&pageNum=` | `AssetResponse` | 资产余额（分页，按类型分组） |
| GET | `/ex/asset/account/balance/ratio` | `?apiId=` | `{ ALL: AssetBalance[] }` | 资产分布比例 |
| GET | `/ex/asset/trendChart` | `?apiId=&interval=` | `{ date, asset }[]` | 资产趋势（24h/7d/30d/90d） |
| GET | `/ex/asset/change/date` | `?beginTime=&endTime=` | `Record<string, number>` | 按日期资产变动 |

#### 交易数据

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/ex/contractPosition` | `?apiId=` | `PositionData[]` | 合约持仓列表 |
| GET | `/ex/entrustOrders` | `?apiId=` | `OrderData[]` | 当前委托列表 |
| GET | `/ex/historyOrders` | `?apiId=&symbol=&limit=&since=&until=` | `HistoryOrder[]` | 历史委托 |

#### 统计数据

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/ex/depositAndWithdraw/sta` | `?apiId=` | `DepositWithdrawStats` | 充提统计 |
| GET | `/ex/analysisStat/summary` | `?startDate=&endDate=` | `AnalysisSummary` | 分析摘要 |
| GET | `/ex/calendar` | `?year=&month=&type=` | `CalendarData[]` | 日历盈亏数据 |

#### 同步日志

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/ex/syncLogs` | `?apiId=&limit=` | `SyncLog[]` | 同步日志列表 |

#### 标签 & 笔记

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/tags` | - | `TradeTag[]` | 获取所有标签 |
| POST | `/tags` | `{ name, color }` | `TradeTag` | 创建标签 |
| PUT | `/tags/:id` | `{ name?, color? }` | `TradeTag` | 更新标签 |
| DELETE | `/tags/:id` | - | `void` | 删除标签 |
| GET | `/notes` | `?tagId=&page=&limit=` | `Note[]` | 获取笔记列表 |
| GET | `/notes/:id` | - | `Note` | 获取笔记详情 |
| POST | `/notes` | `{ title, content, tagIds? }` | `Note` | 创建笔记 |
| PUT | `/notes/:id` | `{ title?, content?, tagIds? }` | `Note` | 更新笔记 |
| DELETE | `/notes/:id` | - | `void` | 删除笔记 |

#### 设置

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/settings` | - | `AppSettings` | 获取所有设置 |
| GET | `/settings/:key` | - | `string` | 获取单个设置 |
| PUT | `/settings` | `{ key, value }` | `void` | 批量设置 |
| DELETE | `/settings/:key` | - | `void` | 删除设置 |

---

## 6. 数据库设计

### 6.1 技术选型

使用 **SQLite** 作为数据库，原因：
- 个人工具，无需并发写入
- 零配置，单文件部署
- 备份简单（复制 db 文件即可）

### 6.2 ER 图

```
┌──────────────────┐       ┌──────────────────┐
│  exchange_apis   │       │  exchange_names  │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │──┐    │ id (PK)          │
│ exchange_id (FK) │  │    │ name             │
│ name             │  └───>│ logo             │
│ api_key (加密)    │       └──────────────────┘
│ secret_key (加密) │
│ passphrase (加密) │       ┌──────────────────┐
│ star             │       │  asset_snapshots │
│ status           │       ├──────────────────┤
│ created_at       │       │ id (PK)          │
│ updated_at       │       │ api_id (FK)      │
└──────────────────┘       │ date             │
                           │ total_asset_usd  │
                           │ created_at       │
                           └──────────────────┘
┌──────────────────┐
│  trade_tags      │       ┌──────────────────┐
├──────────────────┤       │  trade_notes     │
│ id (PK)          │──┐    ├──────────────────┤
│ name             │  │    │ id (PK)          │
│ color            │  │    │ title            │
│ created_at       │  │    │ content          │
└──────────────────┘  ├───>│ created_at       │
                       │    │ updated_at       │
┌──────────────────┐  │    └──────────────────┘
│  note_tags       │  │
├──────────────────┤  │    ┌──────────────────┐
│ note_id (FK)     │──┘    │  app_settings    │
│ tag_id (FK)      │       ├──────────────────┤
└──────────────────┘       │ key (PK)         │
                           │ value (TEXT/JSON) │
┌──────────────────┐       └──────────────────┘
│  sync_logs       │
├──────────────────┤
│ id (PK)          │
│ api_id (FK)      │
│ sync_type        │
│ status           │
│ started_at       │
│ finished_at      │
│ records_synced   │
│ error_message    │
└──────────────────┘
```

### 6.3 表结构

#### exchange_apis — 交易所 API 配置

```sql
CREATE TABLE exchange_apis (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  exchange_id INTEGER NOT NULL,
  name        TEXT NOT NULL,
  api_key     TEXT NOT NULL,             -- AES-256-GCM 加密
  secret_key  TEXT NOT NULL,             -- AES-256-GCM 加密
  passphrase  TEXT,                      -- OKX 专用，加密存储
  star        INTEGER DEFAULT 0,
  status      INTEGER DEFAULT 1,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER,
  FOREIGN KEY (exchange_id) REFERENCES exchange_names(id)
);
```

#### asset_snapshots — 资产快照

```sql
CREATE TABLE asset_snapshots (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  api_id          INTEGER NOT NULL,
  date            TEXT NOT NULL,         -- YYYY-MM-DD
  total_asset_usd REAL NOT NULL,
  created_at      INTEGER NOT NULL,
  UNIQUE(api_id, date),
  FOREIGN KEY (api_id) REFERENCES exchange_apis(id)
);
```

#### trade_tags — 交易标签

```sql
CREATE TABLE trade_tags (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  color      TEXT NOT NULL DEFAULT '#007AFF',
  created_at INTEGER NOT NULL
);
```

#### trade_notes — 交易笔记

```sql
CREATE TABLE trade_notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  content    TEXT DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

#### note_tags — 笔记-标签关联

```sql
CREATE TABLE note_tags (
  note_id INTEGER NOT NULL,
  tag_id  INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES trade_notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES trade_tags(id) ON DELETE CASCADE
);
```

#### app_settings — 应用设置

```sql
CREATE TABLE app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

#### exchange_names — 交易所元数据

```sql
CREATE TABLE exchange_names (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo TEXT
);
```

#### sync_logs — 同步日志

```sql
CREATE TABLE sync_logs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  api_id          INTEGER NOT NULL,
  sync_type       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'running',
  started_at      INTEGER NOT NULL,
  finished_at     INTEGER,
  records_synced  INTEGER DEFAULT 0,
  error_message   TEXT,
  FOREIGN KEY (api_id) REFERENCES exchange_apis(id)
);
```

---

## 7. 前端页面规范

### 7.1 设计规范

| 属性 | 值 |
|------|-----|
| 背景色 | `#f5f5f7` |
| 卡片背景 | `#ffffff` |
| 主色 | `#007aff` |
| 文字主色 | `#1d1d1f` |
| 文字次色 | `#86868b` |
| 成功色 | `#34c759` |
| 错误色 | `#ff3b30` |
| 警告色 | `#ff9500` |
| 卡片圆角 | `16px` |
| 按钮圆角 | `8px` |
| 卡片阴影 | `0 1px 3px rgba(0,0,0,0.08)` |

### 7.2 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | → `/dashboard` | 重定向 |
| `/dashboard` | DashboardPage | 账户总览（总览/表现/分析 3 Tab） |
| `/calendar` | CalendarPage | 盈亏日历 |
| `/tags` | TagsPage | 标签管理 |
| `/notes` | NotesPage | 交易笔记 |
| `/api` | ApiManagerPage | API 管理 |
| `/api/add` | ApiManagerPage | 添加 API |
| `/settings` | SettingsPage | 设置 |

### 7.3 组件规范

- 所有组件使用 TypeScript + 函数式组件
- 状态管理：服务端状态用 React Query，客户端状态用 Zustand
- 图表统一使用 ECharts，通过 `echarts-for-react` 封装
- 表格统一使用 MUI Table 组件
- 对话框统一使用 MUI Dialog
- 加载状态统一使用 Skeleton 骨架屏组件
- 国际化统一使用 `useTranslation()` 的 `t()` 函数

### 7.4 主题系统

当前仅支持 **light mode**，主题配置位于 `apps/web/src/theme/index.ts`。

macOS 极简风格设计要点：
- 浅色背景 + 白色卡片 + 极简阴影
- SF Pro 字体栈
- 圆角设计（卡片 16px、按钮 8px）
- 毛玻璃效果 AppBar（`backdrop-filter: blur(20px)`）
- 选中态使用主色半透明背景

---

## 8. 版本路线图

```
v0.1.0 ─── v0.2.0 ─── v0.3.0 ─── v0.4.0 ─── v1.0.0 ─── v1.1.0 ─── v1.2.0 ─── v1.3.0
  │           │           │           │           │           │           │           │
  初始原型    后端搭建    功能完善    架构重构    正式发布    体验升级    实时化      质量加固
  (已完成)    数据对接    体验优化    质量提升              主题+数据   移动端      高级功能
```

| 版本 | 主题 | 核心目标 | 状态 |
|------|------|----------|------|
| v0.1.0 | 初始原型 | 前端 UI 搭建、模拟数据展示 | ✅ 已发布 |
| v0.2.0 | 后端搭建 | 后端服务、数据同步、替换模拟数据 | ✅ 已发布 |
| v0.3.0 | 功能完善 | 表现/分析 Tab、笔记标签持久化、i18n 接入 | ✅ 已发布 |
| v0.4.0 | 架构重构 | React Query 迁移、测试覆盖、技术债清理 | ✅ 已发布 |
| v1.0.0 | 正式发布 | Docker、CI/CD、安全加固、生产优化 | ✅ 已发布 |
| v1.1.0 | 体验升级 | 暗色主题、日期筛选、分析增强、数据导出 | 🔜 待开发 |
| v1.2.0 | 实时化 | WebSocket、移动端适配、PWA、性能优化 | 📋 规划中 |
| v1.3.0 | 质量加固 | 测试覆盖率、高级分析、快捷键、备份 | 📋 规划中 |

---

## 9. 各版本详细任务拆分

### 9.1 v0.1.0 ~ v1.0.0 — 已完成版本

> 以下版本已全部完成并发布，详见 CHANGELOG.md

| 版本 | 完成任务数 | 核心交付 |
|------|-----------|----------|
| v0.1.0 | - | 前端框架搭建、6 个页面 UI、模拟数据 |
| v0.2.0 | 15 | 后端服务、SQLite 数据库、ccxt 对接、数据同步 |
| v0.3.0 | 10 | 标签/笔记/设置 CRUD、Dashboard Tab、Toast、i18n |
| v0.4.0 | 9 | React Query 迁移、骨架屏、测试、README、类型统一 |
| v1.0.0 | 7 | 历史委托、同步持久化、Docker、CI/CD、安全加固 |

### 9.2 v1.1.0 — 体验升级

> **目标**：补齐功能缺口，提升日常使用体验

#### 阶段 A：暗色主题（预计 2 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| A1 | 创建 dark palette | 所有颜色值定义完整，与 light mode 对称 | P0 |
| A2 | 主题切换逻辑 | MUI ThemeProvider 动态切换，localStorage 持久化 | P0 |
| A3 | ECharts 图表联动 | 所有图表跟随主题切换配色 | P0 |
| A4 | 设置页主题切换入口 | 语言切换旁添加主题切换下拉框 | P1 |

#### 阶段 B：日期筛选 + 分析增强（预计 3 天）

| # | 任务 | 验收标准 | 参数 | 优先级 |
|---|------|----------|------|--------|
| B1 | 全局 DateRangePicker 组件 | 支持快捷选项（7d/30d/90d/自定义），MUI DatePicker 封装 | P0 |
| B2 | Dashboard 接入日期筛选 | 总览/表现/分析 Tab 数据按日期范围过滤 | P0 |
| B3 | Calendar 接入日期筛选 | 可筛选特定月份范围 | P1 |
| B4 | 表现分析增强 | 胜率、盈亏比、平均盈利/亏损、最大连胜/连亏、最大回撤 | P0 |
| B5 | 分析摘要完善 | 调用 `getAnalysisSummary`，展示资产变动摘要 | P1 |

#### 阶段 C：数据导出/导入 + 代码规范（预计 2 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| C1 | 后端数据导出接口 | `POST /settings/export` 支持 JSON 格式导出全部数据 | P1 |
| C2 | 后端数据导入接口 | `POST /settings/import` 支持 JSON 导入，数据校验 + 冲突处理 | P1 |
| C3 | 前端导出/导入 UI | 设置页数据管理区域完善，下载/上传文件交互 | P1 |
| C4 | ESLint + Prettier 配置 | 统一代码风格，修复 CI lint 步骤（移除 `\|\| true`） | P1 |
| C5 | 笔记搜索 + 筛选 | 笔记页添加关键词搜索、标签筛选、排序功能 | P2 |
| C6 | 历史委托前端页 | 新增历史委托 Tab 或页面，对接 `/historyOrders` API | P2 |

### 9.3 v1.2.0 — 实时化 + 移动端

> **目标**：实时数据推送 + 多端可用

#### 阶段 A：WebSocket 实时推送（预计 3 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| A1 | 后端 ws 模块 | WebSocket 服务器，支持价格/持仓/委托频道订阅 | P0 |
| A2 | 前端 ws 客户端 | 自动连接/断线重连/心跳检测 | P0 |
| A3 | React Query 集成 | ws 数据更新触发 QueryCache 失效，智能刷新 | P1 |
| A4 | 连接状态指示器 | UI 显示 ws 连接状态（已连接/重连中/断开） | P2 |

#### 阶段 B：移动端适配（预计 3 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| B1 | 响应式布局框架 | MUI Breakpoints 断点定义，全局响应式容器 | P0 |
| B2 | 侧边栏 → 底部导航 | 移动端侧边栏收起，显示底部 Tab 导航 | P0 |
| B3 | 表格 → 卡片布局 | 移动端资产/持仓/委托表格改为卡片列表 | P0 |
| B4 | 触摸手势支持 | 日历左右滑动切换月份，下拉刷新 | P1 |
| B5 | 图表响应式 | ECharts 图表自适应容器宽度 | P1 |

#### 阶段 C：PWA + 性能优化（预计 2 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| C1 | PWA manifest | 应用名称/图标/主题色配置 | P1 |
| C2 | Service Worker | 离线缓存静态资源，缓存优先策略 | P1 |
| C3 | 安装提示 | 浏览器安装提示 Banner | P2 |
| C4 | 路由懒加载 | React.lazy + Suspense 按路由代码分割 | P1 |
| C5 | ECharts 按需加载 | 仅加载使用的图表组件 | P1 |
| C6 | 通知系统 | 价格预警、同步状态变更浏览器通知 | P2 |

### 9.4 v1.3.0 — 质量加固 + 高级功能

> **目标**：测试覆盖 + 高级交易分析

#### 阶段 A：测试覆盖率提升（预计 3 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| A1 | Hooks 单元测试 | MSW mock API，5 个 hooks 全覆盖 | P0 |
| A2 | 核心组件测试 | SummaryCard/AssetTable/OrderTable 渲染测试 | P0 |
| A3 | 后端服务测试 | noteService/settingsService/dataSyncService 测试 | P0 |
| A4 | 集成测试 | API 端点端到端测试（supertest） | P1 |
| A5 | 覆盖率报告 | 目标 > 60%，CI 中生成覆盖率报告 | P1 |

#### 阶段 B：高级功能（预计 3 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| B1 | 更多交易所功能 | 杠杆设置、子账户、资金费率查询 | P1 |
| B2 | K 线图集成 | 交易对 K 线图表（ECharts candlestick） | P1 |
| B3 | 快捷键系统 | 全局快捷键（搜索/Ctrl+K、切换页面、刷新） | P2 |
| B4 | 数据备份自动化 | 定时自动备份 SQLite，备份文件管理 | P2 |
| B5 | 桌面应用封装 | Tauri 封装，原生菜单栏、系统托盘 | P3 |

---

## 10. 验收标准

### 10.1 各版本通用验收标准

| 维度 | 标准 |
|------|------|
| **功能** | 所有该版本任务清单中的 P0 任务 100% 完成 |
| **构建** | `pnpm build` 零错误零警告 |
| **类型** | `pnpm typecheck` 零错误 |
| **运行** | `pnpm dev` 启动后所有页面可正常访问 |
| **测试** | `pnpm test` 全部通过 |
| **同步** | 代码和文档每 2 个任务同步到 GitHub |

### 10.2 v1.0.0 已达成验收

- [x] 后端服务可独立启动，数据库自动初始化
- [x] 添加交易所 API 后 Dashboard 显示真实资产数据
- [x] 资产趋势图显示真实历史数据
- [x] 盈亏日历显示真实每日盈亏
- [x] API 管理页可增删改查
- [x] API Key 在数据库中加密存储
- [x] 标签和笔记数据持久化
- [x] 中英文切换正常
- [x] 设置页面可正常访问和操作
- [x] React Query 全面替代手动轮询
- [x] Docker 构建和部署正常
- [x] CI/CD 流水线通过
- [x] 21 个测试用例全部通过

### 10.3 v1.1.0 专项验收

- [ ] 暗色主题切换正常，所有页面/图表配色正确
- [ ] 主题偏好 localStorage 持久化，刷新后保持
- [ ] 日期范围选择器在 Dashboard 各 Tab 正常工作
- [ ] 表现分析展示胜率/盈亏比/最大连胜连亏等指标
- [ ] 数据导出 JSON 文件可正常下载
- [ ] 数据导入 JSON 文件可正常恢复
- [ ] ESLint 零错误，CI lint 步骤正常执行

### 10.4 v1.2.0 专项验收

- [ ] WebSocket 实时推送价格/持仓数据
- [ ] 移动端（< 768px）布局正常，底部导航可用
- [ ] PWA 可安装，离线可访问静态页面
- [ ] 路由懒加载生效，首屏 JS 体积减小
- [ ] Lighthouse 性能评分 > 90

### 10.5 v1.3.0 专项验收

- [ ] 测试覆盖率 > 60%
- [ ] CI 中生成覆盖率报告
- [ ] K 线图正常展示
- [ ] 快捷键系统正常工作
- [ ] 数据自动备份功能正常
