// packages/core/src/services/note.ts

import { apiClient } from './api';
import type { TradeTag, Note } from '../types';

// 标签和笔记服务
export class NoteTagService {
  // 获取所有标签
  static async getTags(): Promise<TradeTag[]> {
    return apiClient.get<TradeTag[]>('/tags');
  }

  // 添加标签
  static async addTag(data: { name: string; color: string }): Promise<TradeTag> {
    return apiClient.post<TradeTag>('/tags', data as Record<string, unknown>);
  }

  // 更新标签
  static async updateTag(id: number, data: { name?: string; color?: string }): Promise<TradeTag> {
    return apiClient.put<TradeTag>(`/tags/${id}`, data as Record<string, unknown>);
  }

  // 删除标签
  static async deleteTag(id: number): Promise<void> {
    await apiClient.delete<void>(`/tags/${id}`);
  }

  // 获取所有笔记
  static async getNotes(): Promise<Note[]> {
    return apiClient.get<Note[]>('/notes');
  }

  // 获取单个笔记
  static async getNoteById(id: number): Promise<Note> {
    return apiClient.get<Note>(`/notes/${id}`);
  }

  // 添加笔记
  static async addNote(data: { title: string; content: string; tagIds?: number[] }): Promise<Note> {
    return apiClient.post<Note>('/notes', data as Record<string, unknown>);
  }

  // 更新笔记
  static async updateNote(id: number, data: { title?: string; content?: string; tagIds?: number[] }): Promise<Note> {
    return apiClient.put<Note>(`/notes/${id}`, data as Record<string, unknown>);
  }

  // 删除笔记
  static async deleteNote(id: number): Promise<void> {
    await apiClient.delete<void>(`/notes/${id}`);
  }
}

export const noteTagService = new NoteTagService();
