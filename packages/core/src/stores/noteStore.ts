// packages/core/src/stores/noteStore.ts

import { create } from 'zustand';
import { NoteTagService } from '../services/note';
import type { Note, TradeTag } from '../types';

interface NoteState {
  notes: Note[];
  tags: TradeTag[];
  isLoading: boolean;
  error: string | null;

  // 标签操作
  fetchTags: () => Promise<void>;
  addTag: (data: { name: string; color: string }) => Promise<void>;
  updateTag: (id: number, data: { name?: string; color?: string }) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;

  // 笔记操作
  fetchNotes: () => Promise<void>;
  addNote: (data: { title: string; content: string; tagIds?: number[] }) => Promise<void>;
  updateNote: (id: number, data: { title?: string; content?: string; tagIds?: number[] }) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const tags = await NoteTagService.getTags();
      set({ tags });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addTag: async (data) => {
    try {
      await NoteTagService.addTag(data);
      await get().fetchTags();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateTag: async (id, data) => {
    try {
      await NoteTagService.updateTag(id, data);
      await get().fetchTags();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteTag: async (id) => {
    try {
      await NoteTagService.deleteTag(id);
      await get().fetchTags();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await NoteTagService.getNotes();
      set({ notes });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addNote: async (data) => {
    try {
      await NoteTagService.addNote(data);
      await get().fetchNotes();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateNote: async (id, data) => {
    try {
      await NoteTagService.updateNote(id, data);
      await get().fetchNotes();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteNote: async (id) => {
    try {
      await NoteTagService.deleteNote(id);
      await get().fetchNotes();
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
