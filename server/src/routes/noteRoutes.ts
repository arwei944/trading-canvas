import { Router, Request, Response } from 'express';
import * as noteService from '../services/noteService.js';
import { success, fail } from '../utils/response.js';

export const noteRouter: Router = Router();

// 获取所有笔记
noteRouter.get('/', (_req: Request, res: Response) => {
  try {
    const data = noteService.getNotes();
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 获取单个笔记
noteRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      res.json(fail('无效的笔记 ID'));
      return;
    }
    const data = noteService.getNoteById(id);
    if (!data) {
      res.json(fail('笔记不存在'));
      return;
    }
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 添加笔记
noteRouter.post('/', (req: Request, res: Response) => {
  try {
    const { title, content, tagIds } = req.body;
    if (!title) {
      res.json(fail('缺少必填参数 title'));
      return;
    }
    const data = noteService.addNote({ title, content: content || '', tagIds });
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 更新笔记
noteRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      res.json(fail('无效的笔记 ID'));
      return;
    }
    const { title, content, tagIds } = req.body;
    const data = noteService.updateNote(id, { title, content, tagIds });
    if (!data) {
      res.json(fail('笔记不存在'));
      return;
    }
    res.json(success(data));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});

// 删除笔记
noteRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      res.json(fail('无效的笔记 ID'));
      return;
    }
    noteService.deleteNote(id);
    res.json(success(null));
  } catch (err: any) {
    res.json(fail(err.message));
  }
});
