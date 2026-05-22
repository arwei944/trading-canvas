# TradingCanvas

个人加密货币交易日志管理平台。追踪资产变动、记录交易笔记、分析盈亏表现。

## 功能特性

- **资产总览** — 实时查看多交易所资产分布和趋势
- **盈亏分析** — 总盈亏、24h 变动、合约 PnL 可视化
- **交易日历** — 热力图展示每日盈亏
- **交易笔记** — 记录交易思路，支持标签分类
- **API 管理** — 安全管理交易所 API Key（AES-256-GCM 加密）
- **多语言** — 支持中文/英文切换
- **数据同步** — 定时自动同步交易所数据

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite 5 + MUI 5 + ECharts |
| 状态管理 | Zustand + TanStack React Query |
| 后端 | Express + TypeScript + better-sqlite3 |
| 交易所对接 | ccxt（支持 Binance、OKX、Bybit 等） |
| 国际化 | react-i18next |
| 测试 | Vitest + Testing Library |

## 项目结构

```
trading-canvas/
├── apps/web/          # 前端应用
│   └── src/
│       ├── components/    # 通用组件
│       ├── layouts/       # 布局组件
│       ├── pages/         # 页面组件
│       └── locales/       # 国际化文件
├── packages/
│   ├── core/          # 核心包（类型、服务、Store）
│   └── hooks/         # 自定义 Hooks
├── server/             # 后端服务
│   └── src/
│       ├── adapters/      # 交易所适配器
│       ├── db/            # 数据库
│       ├── routes/        # API 路由
│       ├── services/      # 业务逻辑
│       └── utils/         # 工具函数
├── DEVELOPMENT.md     # 开发文档
├── VERSION_CONTROL.md # 版本管理规范
├── PROGRESS.md       # 开发进度
└── CHANGELOG.md      # 变更日志
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装

```bash
git clone https://github.com/arwei944/trading-canvas.git
cd trading-canvas
pnpm install
```

### 配置

复制环境变量模板并填写：

```bash
cp .env.example .env
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 后端端口 | `3001` |
| `ENCRYPTION_KEY` | API 加密密钥（32 字节） | 自动生成 |
| `DB_PATH` | 数据库路径 | `./data/trading-canvas.db` |
| `SYNC_INTERVAL_MINUTES` | 同步间隔（分钟） | `5` |

### 启动开发服务器

```bash
# 启动后端
pnpm --filter server dev

# 启动前端（新终端）
pnpm --filter web dev
```

前端访问 http://localhost:5173，后端 API http://localhost:3001。

### 运行测试

```bash
pnpm test
```

## 支持的交易所

| 交易所 | 现货 | 合约 |
|--------|------|------|
| Binance | ✅ | ✅ |
| OKX | ✅ | ✅ |
| Bybit | ✅ | ✅ |
| Gate.io | ✅ | ✅ |
| Bitget | ✅ | ✅ |
| HTX | ✅ | ✅ |

## 文档

- [开发文档](./DEVELOPMENT.md) — 架构设计、API 设计、数据库设计
- [版本管理规范](./VERSION_CONTROL.md) — Git Flow、Conventional Commits
- [开发进度](./PROGRESS.md) — 各模块完成度和已知问题
- [变更日志](./CHANGELOG.md) — 版本变更记录

## License

MIT
