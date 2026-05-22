import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/exchangeRoutes.js';
import { dataRouter } from './routes/dataRoutes.js';
import { tagRouter } from './routes/tagRoutes.js';
import { noteRouter } from './routes/noteRoutes.js';
import { settingsRouter } from './routes/settingsRoutes.js';
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
  app.use('/ex/tags', tagRouter);
  app.use('/ex/notes', noteRouter);
  app.use('/ex/settings', settingsRouter);

  // 错误处理
  app.use(errorHandler);

  return app;
}
