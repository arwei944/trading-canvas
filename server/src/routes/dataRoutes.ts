import { Router, Request, Response } from 'express';
import * as dataService from '../services/dataSyncService.js';
import { getSyncLogs } from '../services/syncLogService.js';
import { success, fail } from '../utils/response.js';

export const dataRouter: Router = Router();

// ============ 价格接口 ============

// BTC/ETH 价格
dataRouter.get('/price/getBTCAndETHPrice', async (_req: Request, res: Response) => {
  try {
    const data = await dataService.getBTCETHPrice();
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// ============ 资产接口 ============

// 资产余额 v2
dataRouter.get('/asset/account/balance/v2', async (req: Request, res: Response) => {
  try {
    const apiId = Number(req.query.apiId);
    const page = Number(req.query.pageNum) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }

    const data = await dataService.getAssets(apiId, page, pageSize);
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 资产分布
dataRouter.get('/asset/account/balance/ratio', async (req: Request, res: Response) => {
  try {
    const apiId = Number(req.query.apiId);
    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }

    const data = await dataService.getAssetRatio(apiId);
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 趋势图
dataRouter.get('/asset/trendChart', async (req: Request, res: Response) => {
  try {
    const apiId = Number(req.query.apiId);
    const interval = (req.query.interval as '24h' | '7d' | '30d' | '90d') || '30d';

    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }

    const data = dataService.getTrendChart(apiId, interval);
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 按日期资产变动
dataRouter.get('/asset/change/date', async (req: Request, res: Response) => {
  try {
    const beginTime = Number(req.query.beginTime);
    const endTime = Number(req.query.endTime);

    if (!beginTime || !endTime) {
      res.json(fail('缺少 beginTime 或 endTime'));
      return;
    }

    const data = dataService.getAssetChangeByDate(beginTime, endTime);
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// ============ 合约与委托接口 ============

// 合约持仓
dataRouter.get('/contractPosition', async (req: Request, res: Response) => {
  try {
    const apiId = Number(req.query.apiId);
    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }

    const data = await dataService.getPositions(apiId);
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 当前委托
dataRouter.get('/entrustOrders', async (req: Request, res: Response) => {
  try {
    const apiId = Number(req.query.apiId);
    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }

    const data = await dataService.getOrders(apiId);
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// ============ 统计接口 ============

// 充提统计
dataRouter.get('/depositAndWithdraw/sta', async (req: Request, res: Response) => {
  try {
    const apiId = Number(req.query.apiId);
    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }

    const data = await dataService.getDepositWithdrawStats(apiId);
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 分析摘要
dataRouter.get('/analysisStat/summary', async (req: Request, res: Response) => {
  try {
    const startDate = Number(req.query.startDate);
    const endDate = Number(req.query.endDate);

    if (!startDate || !endDate) {
      res.json(fail('缺少 startDate 或 endDate'));
      return;
    }

    const data = dataService.getAnalysisSummary(startDate, endDate);
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// ============ 日历接口 ============

// 日历数据
dataRouter.get('/calendar', async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!year || !month) {
      res.json(fail('缺少 year 或 month'));
      return;
    }

    const data = dataService.getCalendar(year, month);
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// ============ 同步接口 ============

// 手动触发同步
dataRouter.post('/api/refresh', async (req: Request, res: Response) => {
  try {
    const { apiId } = req.body;

    if (apiId) {
      // 同步单个 API
      await dataService.syncApiData(Number(apiId));
      res.json(success({ apiId, state: 2, ratio: 100 }));
    } else {
      // 同步所有 API
      const result = await dataService.syncAllApis();
      res.json(success(result));
    }
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 查询同步状态
dataRouter.get('/api/refresh/state', async (req: Request, res: Response) => {
  try {
    const apiId = Number(req.query.apiId);
    if (!apiId) {
      res.json(fail('缺少 apiId'));
      return;
    }

    const state = await dataService.getSyncState(apiId);
    res.json(success({ apiId, ...state }));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// ============ 历史委托接口 ============

// 历史委托
dataRouter.get('/historyOrders', async (req: Request, res: Response) => {
  try {
    const { apiId, symbol, limit, since, until } = req.query;
    if (!apiId) return res.json(fail('apiId is required'));

    const orders = await dataService.getHistoryOrders(Number(apiId), {
      symbol: symbol as string | undefined,
      limit: limit ? Number(limit) : undefined,
      since: since ? Number(since) : undefined,
      until: until ? Number(until) : undefined,
    });
    res.json(success(orders));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// ============ 同步日志接口 ============

// 同步日志
dataRouter.get('/syncLogs', async (req: Request, res: Response) => {
  try {
    const { apiId, limit } = req.query;
    const logs = getSyncLogs(
      apiId ? Number(apiId) : undefined,
      limit ? Number(limit) : 20
    );
    res.json(success(logs));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});
