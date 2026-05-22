import { Router, Request, Response } from 'express';
import * as settingsService from '../services/settingsService.js';
import { success, fail } from '../utils/response.js';

export const settingsRouter = Router();

// 获取所有设置
settingsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const data = settingsService.getSettings();
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 获取单个设置
settingsRouter.get('/:key', (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    if (!key) {
      res.json(fail('缺少 key 参数'));
      return;
    }
    const data = settingsService.getSetting(key);
    if (data === null) {
      res.json(fail('设置不存在'));
      return;
    }
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 批量设置
settingsRouter.put('/', (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      res.json(fail('缺少 settings 参数'));
      return;
    }
    settingsService.batchSetSettings(settings);
    res.json(success(null));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 删除设置
settingsRouter.delete('/:key', (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    if (!key) {
      res.json(fail('缺少 key 参数'));
      return;
    }
    settingsService.deleteSetting(key);
    res.json(success(null));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});
