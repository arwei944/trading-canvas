import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/exchangeRoutes.js';
import { dataRouter } from './routes/dataRoutes.js';
import { tagRouter } from './routes/tagRoutes.js';
import { noteRouter } from './routes/noteRoutes.js';
import { settingsRouter } from './routes/settingsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(): express.Application {
  const app = express();

  // 安全中间件
  app.use(helmet());

  // CORS 配置
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // 压缩中间件
  app.use(compression());

  // 基础中间件
  app.use(express.json());

  // 请求日志（仅开发环境）
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
      });
      next();
    });
  }

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

  // 在生产环境中提供前端静态文件
  if (process.env.NODE_ENV === 'production') {
    const webDistPath = path.resolve(__dirname, '../../apps/web/dist');
    app.use(express.static(webDistPath));

    // 所有未匹配的 GET 请求返回 index.html（SPA 路由支持）
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/ex/') && !req.path.startsWith('/health')) {
        res.sendFile(path.join(webDistPath, 'index.html'));
      }
    });
  }

  // 错误处理
  app.use(errorHandler);

  return app;
}
