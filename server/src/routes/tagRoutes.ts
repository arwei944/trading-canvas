import { Router, Request, Response } from 'express';
import * as tagService from '../services/tagService.js';
import { success, fail } from '../utils/response.js';

export const tagRouter: Router = Router();

// 获取所有标签
tagRouter.get('/', (_req: Request, res: Response) => {
  try {
    const data = tagService.getTags();
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 添加标签
tagRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    if (!name || !color) {
      res.json(fail('缺少必填参数'));
      return;
    }
    const data = tagService.addTag({ name, color });
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 更新标签
tagRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      res.json(fail('无效的标签 ID'));
      return;
    }
    const { name, color } = req.body;
    const data = tagService.updateTag(id, { name, color });
    if (!data) {
      res.json(fail('标签不存在'));
      return;
    }
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 删除标签
tagRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      res.json(fail('无效的标签 ID'));
      return;
    }
    tagService.deleteTag(id);
    res.json(success(null));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});
