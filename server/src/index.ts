import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import { createApp } from './app.js';
import { initDatabase } from './db/index.js';
import { startSyncScheduler } from './services/syncScheduler.js';

// 未捕获的异常处理
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  // 初始化数据库
  await initDatabase();

  // 创建 Express 应用
  const app = createApp();

  // 启动定时同步调度器
  startSyncScheduler();

  app.listen(PORT, () => {
    console.log(`🚀 TradingCanvas Server running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);
