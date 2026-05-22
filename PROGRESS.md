# TradingCanvas 开发进度追踪

> 最后更新：2026-05-22 | 当前版本：v0.2.0

---

## 版本路线图状态

| 版本 | 阶段 | 状态 | 完成度 |
|------|------|------|--------|
| v0.1.0 | 初始原型 | ✅ 已发布 | 100% |
| v0.2.0 | 后端搭建 & 数据对接 | ✅ 已发布 | 75% |
| v0.3.0 | 功能完善 | 🔲 待开始 | 0% |
| v0.4.0 | 重构优化 | 🔲 待开始 | 0% |
| v1.0.0 | 正式发布 | 🔲 待开始 | 0% |

---

## v0.2.0 完成详情

### 后端模块 — 完成度 75%

| 子模块 | 状态 | 说明 |
|--------|------|------|
| Express 服务框架 | ✅ 完成 | 模块化路由注册，错误处理中间件 |
| 数据库初始化 | ✅ 完成 | SQLite + 7 张表 + 6 家交易所种子数据 |
| API 加密存储 | ✅ 完成 | AES-256-GCM 加密 API Key / Secret Key |
| 交易所 API 管理 | ✅ 完成 | 增删查、星标切换（5 个端点） |
| 数据同步服务 | ✅ 完成 | ccxt 对接，13 个数据获取方法 |
| 定时同步调度 | ✅ 完成 | node-cron 定时任务（默认 5 分钟） |
| 数据查询路由 | ✅ 完成 | 12 个端点（资产/持仓/委托/日历等） |
| 标签/笔记/设置路由 | ❌ 缺失 | 数据库表已建，但无 CRUD 路由 |
| API 更新路由 | ❌ 缺失 | `PUT /api/update` 未实现 |
| 历史委托路由 | ❌ 缺失 | `/historyOrders` 未实现 |
| 单元测试 | ❌ 缺失 | 0% 测试覆盖 |

### 前端模块 — 完成度 60%

| 页面 | 状态 | 数据对接 |
|------|------|----------|
| DashboardPage（总览） | ✅ 完成 | 真实 API（useAssets/usePositions/useOrders） |
| CalendarPage（日历） | ✅ 完成 | 真实 API（useCalendar） |
| ApiManagerPage（API 管理） | ✅ 完成 | 真实 API（exchangeStore） |
| AccountDetailPage（账户详情） | ⚠️ 模拟数据 | 硬编码数据，未对接 API |
| NotesPage（笔记） | ⚠️ 模拟数据 | useState 管理，刷新丢失 |
| TagsPage（标签） | ⚠️ 模拟数据 | useState 管理，刷新丢失 |
| SettingsPage（设置） | ❌ 缺失 | 页面和路由均未创建 |
| Dashboard "表现" Tab | ❌ 缺失 | Tab 按钮存在，无渲染内容 |
| Dashboard "分析" Tab | ❌ 缺失 | Tab 按钮存在，无渲染内容 |

### 核心包 — 完成度 70%

| 子模块 | 状态 | 说明 |
|--------|------|------|
| 类型定义（types） | ✅ 完成 | ExchangeAPI、AssetBalance、PositionData 等完整定义 |
| API 客户端（api.ts） | ✅ 完成 | Axios 封装，统一响应解包 |
| 交易所服务（exchange.ts） | ✅ 完成 | 15 个方法覆盖所有已实现端点 |
| 交易所 Store（exchangeStore） | ✅ 完成 | Zustand，管理列表/增删/星标 |
| 笔记/标签 Store | ❌ 缺失 | 类型已定义，无对应 Store |
| Hooks（6 个） | ✅ 完成 | useAssets/usePositions/useOrders/useCalendar/usePrice/useAssetRatio |
| useNotes/useTags | ❌ 缺失 | 未创建 |

### 文档 & 配置 — 完成度 85%

| 项目 | 状态 |
|------|------|
| DEVELOPMENT.md（开发文档） | ✅ 完成（715 行，10 章节） |
| VERSION_CONTROL.md（版本管理规范） | ✅ 完成（562 行，9 章节） |
| PROGRESS.md（进度追踪） | ✅ 完成（本文件） |
| CHANGELOG.md | ✅ 完成 |
| .env.example | ✅ 完成 |
| .gitignore | ✅ 完成 |
| Vite 代理配置 | ✅ 完成（/ex → localhost:3001） |
| README.md | ❌ 缺失 |

---

## 已知问题

### 高优先级

| # | 问题 | 模块 | 影响 |
|---|------|------|------|
| 1 | 标签/笔记/设置后端路由缺失 | 后端 | 前端页面无法持久化数据 |
| 2 | NotesPage/TagsPage 使用模拟数据 | 前端 | 数据刷新即丢失 |
| 3 | 充提统计返回占位数据（全 0） | 后端 | 总览页充值/提现/盈亏数据不准确 |
| 4 | 资产类型推断始终返回 SPOT | 后端 | 无法区分现货/合约/理财 |
| 5 | 无任何测试 | 全局 | 代码质量无保障 |

### 中优先级

| # | 问题 | 模块 | 影响 |
|---|------|------|------|
| 6 | Dashboard "表现"/"分析" Tab 无内容 | 前端 | 用户无法查看分析数据 |
| 7 | AccountDetailPage 与 Dashboard 功能重叠 | 前端 | 代码冗余 |
| 8 | i18n 未实际接入 | 前端 | 仅支持中文 |
| 9 | 无 Toast 通知 | 前端 | API 操作无用户反馈 |
| 10 | 同步状态仅内存存储 | 后端 | 服务重启后丢失同步进度 |

### 低优先级

| # | 问题 | 模块 | 影响 |
|---|------|------|------|
| 11 | ExchangeService 方法风格不一致（static vs 实例） | 核心 | 代码风格不统一 |
| 12 | 前端类型与后端字段不完全匹配 | 核心 | 潜在运行时错误 |
| 13 | 无 Loading 骨架屏 | 前端 | 用户体验可优化 |
| 14 | 无 README.md | 文档 | 新人无法快速了解项目 |

---

## v0.3.0 计划（功能完善）

- [ ] 实现标签/笔记/设置后端 CRUD 路由
- [ ] 创建 notesStore / tagsStore
- [ ] 对接 NotesPage / TagsPage 到真实 API
- [ ] 创建 SettingsPage
- [ ] 完善 Dashboard "表现" Tab（PnL 分析图表）
- [ ] 完善 Dashboard "分析" Tab（交易统计摘要）
- [ ] 实现充提统计真实数据对接
- [ ] 修复资产类型推断（区分 SPOT/FUTURES）
- [ ] 添加 Toast 通知组件
- [ ] 添加 API 更新路由（PUT /api/update）

---

## v0.4.0 计划（重构优化）

- [ ] 接入 React Query 替代 setInterval 轮询
- [ ] 统一 ExchangeService 方法风格
- [ ] 对齐前后端类型定义
- [ ] 接入 i18n（中/英文切换）
- [ ] 添加 Loading 骨架屏
- [ ] 编写核心模块单元测试（目标覆盖率 > 60%）
- [ ] 创建 README.md
- [ ] 代码审查与清理
