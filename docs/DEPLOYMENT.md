# TradingCanvas 部署指南

## Hugging Face Space 部署

### 自动保活配置

HF Space 免费 tier 会在 **48小时无访问后自动休眠**，导致首次访问时出现"拒绝连接"错误。

已配置 GitHub Actions 自动保活：
- 文件：`.github/workflows/keep-alive.yml`
- 频率：每 12 小时 ping 一次 health 端点
- 触发：自动 + 手动（workflow_dispatch）

### 国内访问方案

由于网络原因，国内直接访问 `*.hf.space` 可能出现连接问题。推荐以下方案：

#### 方案 1：使用镜像代理（临时）

```
https://cors.isteed.cc/arwei944-trading-canvas.hf.space
```

#### 方案 2：部署到国内平台（推荐长期）

**Vercel / Netlify / Cloudflare Pages：**

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 构建命令：`pnpm build`
4. 输出目录：`apps/web/dist`

**注意：** 需要同时部署后端服务，或使用 Supabase/PlanetScale 等托管数据库。

#### 方案 3：自建服务器

使用 Docker Compose 一键部署：

```bash
docker-compose up -d
```

访问：`http://localhost:7860`

### 环境变量配置

在 HF Space Settings 中配置：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `ENCRYPTION_KEY` | API 密钥加密密钥（32字节） | ✅ |
| `NODE_ENV` | 环境（production） | ✅ |
| `PORT` | 端口（7860） | ✅ |

### 故障排查

**问题：拒绝连接 / Connection Refused**

1. 检查 Space 状态：`https://huggingface.co/spaces/arwei944/trading-canvas`
2. 查看 Logs 确认应用已启动
3. 确认服务器绑定 `0.0.0.0:7860`
4. 等待 30-60 秒冷启动（如果是从休眠唤醒）

**问题：页面空白 / 加载失败**

1. 检查浏览器控制台是否有 JS 错误
2. 确认静态资源（JS/CSS）加载正常
3. 清除浏览器缓存后重试

**问题：API 数据不显示**

1. 在设置中添加交易所 API
2. 检查 API 密钥是否正确
3. 查看后端日志确认同步状态
