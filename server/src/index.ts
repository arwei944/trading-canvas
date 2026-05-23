import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 尝试加载 .env 文件（如果不存在则忽略）
try {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
} catch {
  console.log('[Env] No .env file found, using environment variables');
}

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
  console.log('[Main] Starting TradingCanvas Server...');
  console.log(`[Main] PORT=${PORT}, NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  
  try {
    // 初始化数据库
    console.log('[Main] Initializing database...');
    await initDatabase();
    console.log('[Main] Database initialized successfully');
    
    // 创建 Express 应用
    console.log('[Main] Creating Express app...');
    const app = createApp();
    console.log('[Main] Express app created');
    
    // 启动定时同步调度器
    console.log('[Main] Starting sync scheduler...');
    startSyncScheduler();
    console.log('[Main] Sync scheduler started');
    
    // 启动服务器
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TradingCanvas Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('[Main] Failed to start server:', err);
    process.exit(1);
  }
}

main();
