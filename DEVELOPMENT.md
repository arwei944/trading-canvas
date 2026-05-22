# TradingCanvas 开发文档

> 版本：v0.2.0-draft | 更新日期：2026-05-22
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
| 📊 仪表盘 | 总资产/充提/盈亏汇总、资产趋势图、资产分布饼图、资产/持仓/委托表格 | ✅ UI 完成 |
| 📅 盈亏日历 | 热力图 + 柱状图、周/月/年切换、统计卡片 | ✅ UI 完成 |
| 🔑 API 管理 | 添加/删除交易所 API、星标默认 | ✅ UI 完成 |
| 🏷️ 标签管理 | CRUD、颜色选择 | ⚠️ UI 完成，数据未持久化 |
| 📝 交易笔记 | CRUD、标签关联 | ⚠️ UI 完成，数据未持久化 |
| 📈 表现分析 | 胜率/盈亏比/最大回撤等 | ❌ Tab 已声明，内容未实现 |
| 📉 交易分析 | 分析摘要、资产变动 | ❌ Tab 已声明，内容未实现 |
| ⚙️ 设置 | 偏好设置、数据管理 | ❌ 未实现 |

### 1.3 设计原则

- **个人工具**：无需注册/登录/多用户，打开即用
- **数据本地优先**：敏感数据（API Key）本地存储，后端仅做交易所 API 代理
- **macOS 极简风格**：浅色背景 (#f5f5f7)、灰色图标 (#86868b)、圆角设计、极简阴影
- **渐进增强**：先跑通核心流程，再逐步完善

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
│  │          │ │ 适配器   │ │  (SQLite/JSON)    │     │
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
│       │   ├── components/     # 通用组件
│       │   ├── layouts/        # 布局组件
│       │   ├── locales/        # 国际化
│       │   ├── pages/          # 页面组件
│       │   └── theme/          # 主题配置
│       └── package.json
├── packages/
│   ├── core/                   # 核心包
│   │   └── src/
│   │       ├── services/       # API 服务层
│   │       ├── stores/         # Zustand 状态管理
│   │       └── types/          # TypeScript 类型
│   └── hooks/                  # 自定义 Hooks
│       └── src/                # 数据获取 Hooks
├── server/                     # 后端服务（待创建）
├── pnpm-workspace.yaml
└── package.json
```

### 2.3 数据流

```
用户操作 → 页面组件 → Hooks (React Query) → Core Services → 后端 API → 交易所
                ↑                                              │
                └──────── Zustand Store (全局状态) ←───────────┘
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
| React Query | ^5.18.1 | 服务端状态管理（待全面接入） |
| React Router DOM | ^6.21.3 | 路由 |
| i18next | ^23.8.2 | 国际化（待全面接入） |
| Axios | ^1.6.7 | HTTP 客户端 |
| date-fns | ^4.2.1 | 日期处理 |

### 3.2 后端（规划）

| 技术 | 用途 |
|------|------|
| Node.js + Express/Fastify | HTTP 服务 |
| SQLite + better-sqlite3 | 轻量本地数据库 |
| ccxt | 统一交易所 API 接口 |
| dotenv | 环境变量管理 |
| node-cron | 定时数据同步 |

### 3.3 开发工具

| 工具 | 用途 |
|------|------|
| pnpm | 包管理器 |
| Vitest | 单元测试 |
| ESLint + Prettier | 代码规范 |
| TypeScript | 类型检查 |

---

## 4. 目录结构（目标状态）

```
trading-canvas/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── components/          # 通用 UI 组件
│       │   │   ├── SummaryCard.tsx
│       │   │   ├── TrendChart.tsx
│       │   │   ├── AssetTable.tsx
│       │   │   ├── PositionTable.tsx
│       │   │   ├── OrderTable.tsx
│       │   │   ├── AllocationPie.tsx
│       │   │   └── index.ts
│       │   ├── layouts/
│       │   │   └── MainLayout.tsx
│       │   ├── locales/
│       │   │   ├── en.json
│       │   │   ├── zh.json
│       │   │   └── index.ts
│       │   ├── pages/
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── CalendarPage.tsx
│       │   │   ├── TagsPage.tsx
│       │   │   ├── NotesPage.tsx
│       │   │   ├── ApiManagerPage.tsx
│       │   │   ├── AccountDetailPage.tsx
│       │   │   ├── SettingsPage.tsx      # 待创建
│       │   │   └── index.ts
│       │   ├── theme/
│       │   │   └── index.ts
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages/
│   ├── core/
│   │   └── src/
│   │       ├── services/
│   │       │   ├── api.ts              # HTTP 客户端
│   │       │   ├── exchange.ts         # 交易所服务
│   │       │   └── index.ts
│   │       ├── stores/
│   │       │   ├── exchangeStore.ts    # 交易所状态
│   │       │   └── index.ts
│   │       ├── types/
│   │       │   └── index.ts
│   │       └── index.ts
│   └── hooks/
│       └── src/
│           ├── useAssets.ts
│           ├── usePositions.ts
│           ├── useOrders.ts
│           ├── useCalendar.ts
│           ├── usePrice.ts
│           └── index.ts
├── server/                             # 待创建
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── adapters/                   # 交易所适配器
│   │   ├── db/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── .env.example
├── CHANGELOG.md
├── commitlint.config.js
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
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
| PUT | `/ex/api/update` | `{ apiId, name?, passphrase? }` | `ExchangeAPI` | 更新 API 信息 |
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
| GET | `/ex/historyOrders` | `?apiId=&page=&limit=` | `OrderData[]` | 历史委托（新增） |

#### 统计数据

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/ex/depositAndWithdraw/sta` | `?apiId=` | `DepositWithdrawStats` | 充提统计 |
| GET | `/ex/analysisStat/summary` | `?startDate=&endDate=` | `AnalysisSummary` | 分析摘要 |
| GET | `/ex/calendar` | `?year=&month=&type=` | `CalendarData[]` | 日历盈亏数据（新增） |

#### 标签 & 笔记

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/tags` | - | `TradeTag[]` | 获取所有标签 |
| POST | `/tags` | `{ name, color }` | `TradeTag` | 创建标签 |
| PUT | `/tags/:id` | `{ name?, color? }` | `TradeTag` | 更新标签 |
| DELETE | `/tags/:id` | - | `void` | 删除标签 |
| GET | `/notes` | `?tagId=&page=&limit=` | `Note[]` | 获取笔记列表 |
| POST | `/notes` | `{ title, content, tagIds? }` | `Note` | 创建笔记 |
| PUT | `/notes/:id` | `{ title?, content?, tagIds? }` | `Note` | 更新笔记 |
| DELETE | `/notes/:id` | - | `void` | 删除笔记 |

#### 设置

| 方法 | 端点 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| GET | `/settings` | - | `AppSettings` | 获取设置 |
| PUT | `/settings` | `AppSettings` | `AppSettings` | 更新设置 |
| POST | `/settings/export` | `{ format }` | `Blob` | 导出数据 |
| POST | `/settings/import` | `FormData` | `void` | 导入数据 |

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
                           └──────────────────┘
```

### 6.3 表结构

#### exchange_apis — 交易所 API 配置

```sql
CREATE TABLE exchange_apis (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  exchange_id INTEGER NOT NULL,          -- 交易所 ID (1=Binance, 2=OKX, ...)
  name        TEXT NOT NULL,             -- 自定义名称
  api_key     TEXT NOT NULL,             -- 加密存储
  secret_key  TEXT NOT NULL,             -- 加密存储
  passphrase  TEXT,                      -- OKX 专用，加密存储
  star        INTEGER DEFAULT 0,         -- 0=普通, 1=星标
  status      INTEGER DEFAULT 1,         -- 1=启用, 0=禁用
  created_at  INTEGER NOT NULL,          -- Unix 时间戳 ms
  updated_at  INTEGER,
  FOREIGN KEY (exchange_id) REFERENCES exchange_names(id)
);
```

#### asset_snapshots — 资产快照（用于趋势图）

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

#### app_settings — 应用设置（KV 存储）

```sql
CREATE TABLE app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL          -- JSON 编码
);
```

#### exchange_names — 交易所元数据

```sql
CREATE TABLE exchange_names (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo TEXT
);

-- 初始数据
INSERT INTO exchange_names VALUES (1, 'Binance', '...'), (2, 'OKX', '...'),
  (3, 'Bybit', '...'), (4, 'Bitget', '...'), (6, 'Gate.io', '...'), (8, 'Huobi', '...');
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
| `/dashboard` | DashboardPage | 账户总览 |
| `/dashboard/:id` | DashboardPage | 指定 API 的详情 |
| `/calendar` | CalendarPage | 盈亏日历 |
| `/tags` | TagsPage | 标签管理 |
| `/notes` | NotesPage | 交易笔记 |
| `/api` | ApiManagerPage | API 管理 |
| `/api/add` | ApiManagerPage | 添加 API |
| `/settings` | SettingsPage | 设置（待创建） |

### 7.3 组件规范

- 所有组件使用 TypeScript + 函数式组件
- 状态管理：服务端状态用 React Query，客户端状态用 Zustand
- 图表统一使用 ECharts，通过 `echarts-for-react` 封装
- 表格统一使用 MUI Table 组件
- 对话框统一使用 MUI Dialog

---

## 8. 版本路线图

```
v0.1.0 ─── v0.2.0 ─── v0.3.0 ─── v0.4.0 ─── v1.0.0
  │           │           │           │           │
  初始原型    后端搭建    功能完善    架构重构    正式发布
  (已完成)    数据对接    体验优化    质量提升
```

| 版本 | 主题 | 核心目标 |
|------|------|----------|
| v0.1.0 | 初始原型 | 前端 UI 搭建、模拟数据展示 |
| v0.2.0 | 后端搭建 | 后端服务、数据同步、替换模拟数据 |
| v0.3.0 | 功能完善 | 表现/分析 Tab、笔记标签持久化、i18n 接入 |
| v0.4.0 | 架构重构 | React Query 迁移、测试覆盖、技术债清理 |
| v1.0.0 | 正式发布 | README、CI/CD、性能优化、PWA |

---

## 9. 各版本详细任务拆分

### 9.1 v0.2.0 — 后端搭建 & 数据对接

> **目标**：从纯前端 Demo 变为可用的真实应用

#### 阶段 A：后端基础（预计 3 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| A1 | 初始化 `server/` 包 | Express/Fastify + TypeScript + SQLite 可启动 | P0 |
| A2 | 实现数据库初始化 | 所有表自动创建，初始数据插入 | P0 |
| A3 | 实现 API Key 加密存储 | 使用 AES-256-GCM 加密，密钥从环境变量读取 | P0 |
| A4 | 实现交易所 API 管理接口 | `/ex/api/*` CRUD 完整可用 | P0 |
| A5 | 集成 ccxt 库 | 能通过 ccxt 连接至少一个交易所 | P0 |

#### 阶段 B：数据同步（预计 3 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| B1 | 实现资产数据拉取 | 调用 ccxt 获取余额，写入 asset_snapshots | P0 |
| B2 | 实现持仓/委托数据拉取 | 实时从交易所获取 | P0 |
| B3 | 实现充提统计计算 | 从历史数据聚合 | P1 |
| B4 | 实现定时同步 | node-cron 每 5 分钟自动拉取 | P1 |
| B5 | 实现手动同步触发 | `/ex/api/refresh` 接口 | P1 |

#### 阶段 C：前端对接（预计 2 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| C1 | 配置 Vite API 代理 | 开发环境请求转发到后端 | P0 |
| C2 | 替换 Dashboard 模拟数据 | 资产/持仓/委托显示真实数据 | P0 |
| C3 | 替换 Calendar 模拟数据 | 日历显示真实盈亏 | P0 |
| C4 | 替换 ApiManager 模拟数据 | API 增删改查对接后端 | P0 |
| C5 | 添加全局错误处理 | Error Boundary + Toast 通知 | P1 |
| C6 | 添加 Loading 骨架屏 | 数据加载时显示骨架 | P2 |

#### 阶段 D：清理（预计 1 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| D1 | 修复 AssetTable import 路径 | `@trading-canvas` → `@trading.canvas` | P0 |
| D2 | 清理未使用的代码 | `formatCurrency`、未使用的 hooks 等 | P1 |
| D3 | 环境变量管理 | BASE_URL 等移入 `.env` | P1 |

---

### 9.2 v0.3.0 — 功能完善 & 体验优化

> **目标**：补齐所有已声明但未实现的功能

#### 阶段 A：表现分析（预计 3 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| A1 | 实现"表现" Tab | 胜率、盈亏比、平均盈利/亏损、最大连胜/连亏 | P0 |
| A2 | 实现"分析" Tab | 调用 `getAnalysisSummary`，展示分析摘要 | P0 |
| A3 | 添加日期范围选择器 | 支持自定义时间范围筛选 | P1 |
| A4 | 添加数据导出（CSV） | 表格数据可导出 | P2 |

#### 阶段 B：笔记 & 标签持久化（预计 2 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| B1 | 实现标签后端接口 | CRUD 完整 | P0 |
| B2 | 实现笔记后端接口 | CRUD + 标签关联 | P0 |
| B3 | TagsPage 对接后端 | 数据持久化 | P0 |
| B4 | NotesPage 对接后端 | 数据持久化 | P0 |
| B5 | 统一使用 core 包的 TradeTag/Note 类型 | 替换本地 interface | P1 |

#### 阶段 C：i18n 全面接入（预计 2 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| C1 | 所有页面接入 `useTranslation` | 零硬编码中文 | P0 |
| C2 | 添加语言切换功能 | 设置页面或顶栏切换 | P1 |
| C3 | 补充缺失的翻译 key | 根据实际使用补充 | P1 |

#### 阶段 D：设置页面（预计 2 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| D1 | 创建 SettingsPage | 基础设置页面框架 | P0 |
| D2 | 实现偏好设置 | 语言、主题（预留暗色）、轮询间隔 | P1 |
| D3 | 实现数据管理 | 导出/导入/清空数据 | P1 |
| D4 | 注册路由 | `/settings` 可访问 | P0 |

---

### 9.3 v0.4.0 — 架构重构 & 质量提升

> **目标**：技术债清理，为长期维护打好基础

#### 阶段 A：数据层重构（预计 3 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| A1 | 全面迁移到 React Query | 移除所有手动轮询 hooks | P0 |
| A2 | 统一组件接口 | SummaryCard props 一致性 | P0 |
| A3 | 统一错误处理模式 | 所有 API 调用统一 try-catch + Toast | P0 |
| A4 | 优化数据刷新策略 | staleTime / refetchInterval 合理配置 | P1 |

#### 阶段 B：测试（预计 3 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| B1 | Core 包单元测试 | services / stores 覆盖率 > 80% | P0 |
| B2 | Hooks 单元测试 | MSW mock API，覆盖率 > 80% | P0 |
| B3 | 组件测试 | 关键组件渲染测试 | P1 |
| B4 | E2E 测试 | Playwright 核心流程 | P2 |

#### 阶段 C：代码质量（预计 2 天）

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| C1 | 配置 ESLint + Prettier | 统一代码风格 | P0 |
| C2 | 消除所有硬编码 | 年份列表、轮询间隔等 | P1 |
| C3 | 消除重复代码 | 提取公共工具函数 | P1 |
| C4 | TypeScript 严格模式 | 开启 strict，消除 all errors | P1 |

---

### 9.4 v1.0.0 — 正式发布

> **目标**：生产就绪

| # | 任务 | 验收标准 | 优先级 |
|---|------|----------|--------|
| 1 | 编写 README | 项目介绍、安装指南、截图 | P0 |
| 2 | 添加 LICENSE | MIT 或自定义 | P0 |
| 3 | CI/CD 配置 | GitHub Actions 自动构建/测试 | P1 |
| 4 | 性能优化 | 懒加载、代码分割 | P1 |
| 5 | 暗色主题 | MUI dark mode | P2 |
| 6 | PWA 支持 | Service Worker + manifest.json | P2 |
| 7 | 桌面应用（可选） | Electron / Tauri 封装 | P3 |

---

## 10. 验收标准

### 10.1 各版本通用验收标准

| 维度 | 标准 |
|------|------|
| **功能** | 所有该版本任务清单中的 P0 任务 100% 完成 |
| **构建** | `pnpm build` 零错误零警告 |
| **类型** | `tsc --noEmit` 零错误 |
| **运行** | `pnpm dev` 启动后所有页面可正常访问 |
| **数据** | 无模拟数据残留（v0.2.0 起） |

### 10.2 v0.2.0 专项验收

- [ ] 后端服务可独立启动，数据库自动初始化
- [ ] 添加一个交易所 API 后，Dashboard 显示真实资产数据
- [ ] 资产趋势图显示真实历史数据
- [ ] 盈亏日历显示真实每日盈亏
- [ ] API 管理页可增删改查
- [ ] API Key 在数据库中加密存储

### 10.3 v0.3.0 专项验收

- [ ] "表现" Tab 展示胜率/盈亏比等统计
- [ ] "分析" Tab 展示分析摘要
- [ ] 标签和笔记数据刷新后不丢失
- [ ] 切换语言后所有文本正确翻译
- [ ] 设置页面可正常访问和操作

### 10.4 v0.4.0 专项验收

- [ ] 无手动 setInterval 轮询，全部使用 React Query
- [ ] Core + Hooks 测试覆盖率 > 80%
- [ ] ESLint 零错误
- [ ] TypeScript strict 模式零错误

### 10.5 v1.0.0 专项验收

- [ ] README 完整，新用户可按文档完成安装
- [ ] CI/CD 流水线通过
- [ ] Lighthouse 性能评分 > 90
- [ ] 无已知 P0/P1 Bug
