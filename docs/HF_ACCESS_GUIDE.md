# Hugging Face 国内访问完全指南

## 问题描述

访问任何 `*.hf.space` 或 `huggingface.co` 域名时出现：
- `ERR_CONNECTION_REFUSED`
- `Connection timed out`
- `SSL handshake failed`
- 页面长时间空白加载

## 根本原因

1. **网络层面**：国际出口带宽受限，GFW 干扰
2. **HF 机制**：免费 Space 48小时无访问自动休眠
3. **DNS 问题**：域名解析不稳定

---

## 解决方案

### 方案 1：使用官方国内镜像（最简单）

**hf-mirror.com** - HuggingFace 官方中国镜像

```bash
# 方法1：设置环境变量（推荐）
export HF_ENDPOINT=https://hf-mirror.com

# 方法2：直接替换 URL
# 原地址：https://huggingface.co/spaces/username/space-name
# 镜像地址：https://hf-mirror.com/spaces/username/space-name
```

**适用场景**：
- 下载模型、数据集
- 访问 Space 主页
- 使用 transformers 库

**局限性**：
- 大文件（>1GB）可能仍慢（存储在 AWS US）
- Space 实时交互仍可能不稳定

---

### 方案 2：使用 CORS 代理（访问 Space）

```
https://cors.isteed.cc/{original-hf-space-url}

# 示例
原地址：https://arwei944-trading-canvas.hf.space
代理地址：https://cors.isteed.cc/arwei944-trading-canvas.hf.space
```

**其他可用代理**：
- `https://cors.isteed.cc/`
- `https://cors-anywhere.herokuapp.com/`（需申请权限）
- `https://api.allorigins.win/raw?url=`

---

### 方案 3：代理/VPN（最稳定）

**推荐节点位置**（按速度排序）：
1. 香港 🇭🇰（延迟最低）