import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/exchangeRoutes.js';
import { dataRouter } from './routes/dataRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(): express.Application {
  const app = express();

  // 基础中间件
  app.use(cors());
  app.use(express.json());

  // 健康检查
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // API 路由
  app.use('/ex', apiRouter);
  app.use('/ex', dataRouter);

  // 错误处理
  app.use(errorHandler);

  return app;
}
