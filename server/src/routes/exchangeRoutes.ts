import { Router, Request, Response } from 'express';
import * as exchangeService from '../services/exchangeService.js';
import { success, fail } from '../utils/response.js';

export const apiRouter = Router();

// 获取交易所列表
apiRouter.get('/api/ex_list', (_req: Request, res: Response) => {
  try {
    const data = exchangeService.getExchangeList();
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 添加 API
apiRouter.post('/api/add', (req: Request, res: Response) => {
  try {
    const { exchange_id, name, api_key, secret_key, passphrase } = req.body;
    if (!exchange_id || !name || !api_key || !secret_key) {
      res.json(fail('缺少必填参数'));
      return;
    }
    const data = exchangeService.addExchangeApi({ exchange_id, name, api_key, secret_key, passphrase });
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 删除 API
apiRouter.delete('/api/delete', (req: Request, res: Response) => {
  try {
    const { apiId } = req.body;
    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }
    exchangeService.deleteExchangeApi(Number(apiId));
    res.json(success(null));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 切换星标
apiRouter.put('/api/star', (req: Request, res: Response) => {
  try {
    const { apiId } = req.body;
    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }
    exchangeService.toggleStar(Number(apiId));
    res.json(success(null));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 检查 API 权限
apiRouter.get('/api/checkApiIdPermissions', async (req: Request, res: Response) => {
  try {
    const apiId = Number(req.query.apiId);
    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }
    const api = exchangeService.getDecryptedApi(apiId);
    if (!api) {
      res.json(success(false));
      return;
    }
    // 尝试获取余额来验证权限
    const { createExchange } = await import('../adapters/exchangeAdapter.js');
    const exchange = createExchange(api);
    await exchange.fetchBalance();
    res.json(success(true));
  } catch (err: any) {
    res.json(success(false));
  }
});
