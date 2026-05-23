# TradingCanvas 版本管理规范

> 版本：v1.1 | 更新日期：2026-05-23

---

## 目录

1. [分支策略（Git Flow）](#1-分支策略git-flow)
2. [提交规范（Conventional Commits）](#2-提交规范conventional-commits)
3. [版本号规范（SemVer）](#3-版本号规范semver)
4. [CHANGELOG 规范](#4-changelog-规范)
5. [发布流程](#5-发布流程)
6. [分支命名规范](#6-分支命名规范)
7. [PR / Code Review 规范](#7-pr--code-review-规范)
8. [紧急修复流程](#8-紧急修复流程)
9. [工具配置](#9-工具配置)

---

## 1. 分支策略（Git Flow）

### 1.1 分支模型

```
                    ┌──────────────────────────────────────────┐
main ───────────────┼──────●──────────────────────────────────●── v0.2.0
                    │     ↑                                    ↑
                    │     │ merge                              │ merge
                    │     │                                    │
develop ────────────┼─────●──●──●──●──●──●──●──●────────────●──●
                    │          ↑       ↑         ↑            ↑
                    │          │       │         │            │
feature/auth ───────┼──────────●──●───┘         │            │
                    │                              │            │
feature/dashboard ──┼──────────────────────────────●──●────────┘
                    │
                    │
hotfix/fix-login ───┼────────────────────────────────────────●──→ main
                    │                                         │
                    └─────────────────────────────────────────┘
```

### 1.2 分支说明

| 分支 | 命名 | 保护 | 说明 |
|------|------|------|------|
| `main` | `main` | ✅ 受保护 | 生产分支，每个版本发布时打 Tag |
| `develop` | `develop` | ✅ 受保护 | 开发主线，集成所有功能 |
| `feature/*` | `feature/<task-id>-<简述>` | ❌ | 功能开发分支 |
| `bugfix/*` | `bugfix/<task-id>-<简述>` | ❌ | Bug 修复分支 |
| `hotfix/*` | `hotfix/<版本号>-<简述>` | ❌ | 紧急修复分支（从 main 拉出） |
| `release/*` | `release/v<版本号>` | ❌ | 版本预发布分支（可选） |

### 1.3 分支生命周期

```
1. 从 develop 拉出 feature 分支
   git checkout develop && git pull
   git checkout -b feature/tc-001-remove-auth

2. 在 feature 分支上开发、提交
   git add . && git commit -m "feat: remove auth module"

3. 推送到远程
   git push -u origin feature/tc-001-remove-auth

4. 创建 PR → develop，通过 Review 后合并
   合并后删除 feature 分支

5. develop 积累足够功能后，合并到 main 并打 Tag
   git checkout main && git merge develop
   git tag v0.2.0
```

### 1.4 分支规则

| 规则 | 说明 |
|------|------|
| `main` 只接受 merge | 禁止直接 push |
| `develop` 只接受 merge | 禁止直接 push |
| feature 分支寿命 ≤ 7 天 | 超时需说明原因或拆分 |
| 保持 feature 分支与 develop 同步 | 每天至少 rebase/merge 一次 |
| 合并策略 | feature → develop 用 squash merge，develop → main 用 merge commit |

---

## 2. 提交规范（Conventional Commits）

### 2.1 格式

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### 2.2 Type 类型

| Type | 说明 | 版本影响 | 示例 |
|------|------|----------|------|
| `feat` | 新功能 | MINOR | `feat(dashboard): add performance tab` |
| `fix` | Bug 修复 | PATCH | `fix(api): correct import path` |
| `docs` | 文档变更 | 无 | `docs: update README` |
| `style` | 代码风格（不影响逻辑） | 无 | `style: format with prettier` |
| `refactor` | 重构（不新增功能/不修复 Bug） | 无 | `refactor(hooks): migrate to react-query` |
| `perf` | 性能优化 | PATCH | `perf(chart): lazy load echarts` |
| `test` | 测试相关 | 无 | `test(core): add exchange service tests` |
| `build` | 构建系统/依赖 | 无 | `build: upgrade vite to 5.1` |
| `ci` | CI/CD 配置 | 无 | `ci: add github actions workflow` |
| `chore` | 其他杂项 | 无 | `chore: update .gitignore` |
| `revert` | 回滚提交 | 无 | `revert: feat(dashboard): add tab` |

### 2.3 Scope 范围

| Scope | 说明 |
|-------|------|
| `core` | packages/core 包 |
| `hooks` | packages/hooks 包 |
| `web` | apps/web 应用 |
| `server` | server 后端服务 |
| `dashboard` | 仪表盘页面 |
| `calendar` | 日历页面 |
| `tags` | 标签功能 |
| `notes` | 笔记功能 |
| `api` | API 管理功能 |
| `settings` | 设置功能 |
| `auth` | 认证相关（已移除，保留 scope 以防万一） |
| `theme` | 主题/样式 |
| `i18n` | 国际化 |
| `db` | 数据库相关 |
| `deps` | 依赖管理 |

### 2.4 Subject 规则

- 使用**现在时态**（"add" 而不是 "added"）
- **不要**大写首字母
- **不要**以句号结尾
- 长度 ≤ 72 字符
- 中文项目可用中文 subject

**示例：**

```bash
# 好的提交
feat(dashboard): add performance tab with win rate stats
fix(core): correct AssetTable import path
refactor(hooks): migrate useAssets to react-query
docs: add development guide

# 不好的提交
Update stuff
Fixed bug
WIP
feat: 增加了很多功能，修复了一些bug，重构了代码
```

### 2.5 Body 规则（可选）

- 与 subject 空一行
- 详细描述"为什么"改，而不是"改了什么"（代码 diff 已经说明了）
- 每行 ≤ 72 字符

```bash
feat(server): add exchange API proxy endpoints

Implement ccxt-based exchange adapter to proxy API calls through
the backend, keeping API keys server-side only.

- Support Binance and OKX initially
- Add API key encryption with AES-256-GCM
- Implement rate limiting per exchange
```

### 2.6 Breaking Changes

当引入不兼容变更时，在 footer 中声明：

```bash
feat(api): change response format to camelCase

BREAKING CHANGE: All API response fields are now camelCase.
 snake_case fields are no longer supported.
 Migration script: pnpm run migrate:camel-case
```

---

## 3. 版本号规范（SemVer）

### 3.1 格式

```
MAJOR.MINOR.PATCH
```

| 位 | 含义 | 何时递增 |
|----|------|----------|
| MAJOR | 主版本 | 不兼容的 API 变更 |
| MINOR | 次版本 | 向后兼容的功能新增 |
| PATCH | 修订号 | 向后兼容的 Bug 修复 |

### 3.2 预发布版本

```
v0.2.0-alpha.1    # 内部测试
v0.2.0-beta.1     # 功能完整，可能有 Bug
v0.2.0-rc.1       # 发布候选
v0.2.0            # 正式发布
```

### 3.3 版本规划

| 版本 | 类型 | 主题 | 状态 |
|------|------|------|------|
| v0.1.0 | 初始版本 | 前端 UI 搭建、模拟数据展示 | ✅ 已发布 |
| v0.2.0 | MINOR | 后端搭建 + 数据对接 | ✅ 已发布 |
| v0.3.0 | MINOR | 功能完善 + 体验优化 | ✅ 已发布 |
| v0.4.0 | MINOR | 架构重构 + 质量提升 | ✅ 已发布 |
| v1.0.0 | MAJOR | 正式发布（Docker + CI/CD + 安全加固） | ✅ 已发布 |
| v1.1.0 | MINOR | 体验升级（暗色主题 + 日期筛选 + 分析增强） | 🔜 待开发 |
| v1.2.0 | MINOR | 实时化（WebSocket + 移动端 + PWA） | 📋 规划中 |
| v1.3.0 | MINOR | 质量加固（测试覆盖 + 高级分析） | 📋 规划中 |

---

## 4. CHANGELOG 规范

### 4.1 格式

CHANGELOG.md 遵循 [Keep a Changelog](https://keepachangelog.com/) 格式：

```markdown
# Changelog

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本管理遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added
- 待发布的新功能...

## [0.2.0] - 2026-06-01

### Added
- 后端服务（Express + SQLite）
- 交易所 API 代理（Binance/OKX）
- 资产数据自动同步
- 全局错误处理（Error Boundary + Toast）

### Changed
- Dashboard 使用真实数据替代模拟数据
- Calendar 使用真实盈亏数据

### Fixed
- AssetTable import 路径错误

### Removed
- 认证模块（登录/注册页面、authStore、路由守卫）
- 演示登录模式

## [0.1.0] - 2026-05-22

### Added
- 初始项目搭建（pnpm monorepo）
- Dashboard 页面（汇总卡片、趋势图、饼图、资产/持仓/委托表格）
- Calendar 页面（热力图、柱状图、统计卡片）
- API 管理页面
- 标签管理页面
- 交易笔记页面
- macOS 极简主题
- i18n 基础设施（中/英）
```

### 4.2 变更类型

| 类型 | 说明 |
|------|------|
| `Added` | 新增功能 |
| `Changed` | 对现有功能的变更 |
| `Deprecated` | 即将移除的功能 |
| `Removed` | 已移除的功能 |
| `Fixed` | Bug 修复 |
| `Security` | 安全相关修复 |

### 4.3 自动生成

使用 `conventional-changelog` CLI 自动生成：

```bash
# 安装
pnpm add -Dw conventional-changelog-cli

# 生成 CHANGELOG
pnpm changelog  # 等同于 npx conventional-changelog -p angular -i CHANGELOG.md -s

# 生成指定版本的变更
pnpm changelog -- --release-count 1
```

---

## 5. 发布流程

### 5.1 常规版本发布

```bash
# 1. 确保 develop 分支最新
git checkout develop && git pull

# 2. 运行测试
pnpm test

# 3. 运行构建
pnpm build

# 4. 更新版本号
pnpm version <major|minor|patch> --no-git-tag-version
# 或手动修改 package.json 中的 version

# 5. 更新 CHANGELOG
pnpm changelog

# 6. 提交变更
git add .
git commit -m "chore(release): prepare for v0.2.0"

# 7. 合并到 main 并打 Tag
git checkout main
git merge develop --no-ff -m "release: v0.2.0"
git tag -a v0.2.0 -m "Release v0.2.0: 后端搭建 & 数据对接"

# 8. 推送
git push origin main --tags
git checkout develop && git push origin develop

# 9. 同步 develop 的版本号
git checkout develop
git merge main
```

### 5.2 发布检查清单

- [ ] 所有 P0 任务完成
- [ ] `pnpm test` 通过
- [ ] `pnpm build` 零错误
- [ ] `tsc --noEmit` 零错误
- [ ] CHANGELOG.md 已更新
- [ ] 版本号已更新（root + 所有子包）
- [ ] 无遗留的 `console.log` / `TODO` / `FIXME`
- [ ] 无硬编码的敏感信息（API Key 等）

---

## 6. 分支命名规范

### 6.1 Feature 分支

```
feature/<task-id>-<简述>
```

| 示例 | 说明 |
|------|------|
| `feature/tc-001-remove-auth` | 移除认证模块 |
| `feature/tc-002-server-setup` | 后端服务搭建 |
| `feature/tc-003-react-query` | React Query 迁移 |

### 6.2 Bugfix 分支

```
bugfix/<task-id>-<简述>
```

| 示例 | 说明 |
|------|------|
| `bugfix/tc-010-import-path` | 修复 import 路径 |
| `bugfix/tc-011-calendar-data` | 修复日历数据 |

### 6.3 Hotfix 分支

```
hotfix/<版本号>-<简述>
```

| 示例 | 说明 |
|------|------|
| `hotfix/v0.2.1-api-crash` | v0.2.0 API 崩溃修复 |

### 6.4 Task ID 规则

使用 `tc-XXX` 格式（TradingCanvas 的缩写），从 001 开始递增。

---

## 7. PR / Code Review 规范

### 7.1 PR 标题

遵循 Conventional Commits 格式：

```
<type>(<scope>): <简述>
```

### 7.2 PR 描述模板

```markdown
## 变更说明
<!-- 简要描述这个 PR 做了什么 -->

## 关联任务
<!-- 关联的 Task ID 或 Issue -->
- tc-XXX

## 变更类型
- [ ] feat（新功能）
- [ ] fix（Bug 修复）
- [ ] refactor（重构）
- [ ] docs（文档）
- [ ] test（测试）
- [ ] chore（杂项）

## 测试
<!-- 如何测试这些变更 -->
- [ ] 本地 `pnpm dev` 验证
- [ ] `pnpm test` 通过
- [ ] `pnpm build` 通过

## 截图（如有）
<!-- 附上相关截图 -->
```

### 7.3 Review 要点

| 维度 | 检查项 |
|------|--------|
| 正确性 | 逻辑是否正确，边界是否处理 |
| 类型安全 | 是否有 any 类型，类型是否准确 |
| 命名 | 变量/函数/组件命名是否清晰 |
| 复用 | 是否有可提取的公共逻辑 |
| 性能 | 是否有不必要的重渲染/请求 |
| 安全 | 是否有敏感信息泄露 |
| 风格 | 是否符合项目 ESLint/Prettier 规范 |

---

## 8. 紧急修复流程

```
main (v0.2.0) ─────●──── hotfix/v0.2.1-fix ────●── (v0.2.1)
                     │                            │
                     └──── develop ◄───────────────┘
                          (同步修复)
```

```bash
# 1. 从 main 拉出 hotfix 分支
git checkout main && git pull
git checkout -b hotfix/v0.2.1-fix-crash

# 2. 修复并提交
git add . && git commit -m "fix: resolve API crash on empty response"

# 3. 合并到 main，打补丁 Tag
git checkout main
git merge hotfix/v0.2.1-fix-crash --no-ff
git tag -a v0.2.1 -m "Hotfix v0.2.1: fix API crash"

# 4. 同步到 develop
git checkout develop
git merge hotfix/v0.2.1-fix-crash --no-ff

# 5. 推送并清理
git push origin main develop --tags
git branch -d hotfix/v0.2.1-fix-crash
```

---

## 9. 工具配置

### 9.1 commitlint

安装并配置 commitlint：

```bash
pnpm add -Dw @commitlint/cli @commitlint/config-conventional
```

创建 `commitlint.config.js`：

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
```

### 9.2 husky + lint-staged

```bash
pnpm add -Dw husky lint-staged
pnpm exec husky init
```

`.husky/commit-msg`：

```bash
pnpm exec commitlint --edit $1
```

`.husky/pre-commit`：

```bash
pnpm exec lint-staged
```

`package.json` 中添加：

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 9.3 .editorconfig

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

### 9.4 .gitignore 补充

```gitignore
# 依赖
node_modules/
.pnpm-store/

# 构建产物
dist/
*.tsbuildinfo

# 环境变量
.env
.env.local
.env.*.local

# 数据库
*.db
*.sqlite
*.sqlite3

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*

# 测试
coverage/

# 临时文件
*.tmp
*.bak
```
