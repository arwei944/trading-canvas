import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/note', () => ({
  NoteTagService: {
    getTags: vi.fn().mockResolvedValue([]),
    addTag: vi.fn().mockResolvedValue({ id: 1, name: 'test', color: '#000' }),
    updateTag: vi.fn().mockResolvedValue({ id: 1, name: 'updated', color: '#fff' }),
    deleteTag: vi.fn().mockResolvedValue(undefined),
    getNotes: vi.fn().mockResolvedValue([]),
    getNoteById: vi.fn().mockResolvedValue({ id: 1, title: 'test', content: '' }),
    addNote: vi.fn().mockResolvedValue({ id: 1, title: 'test', content: '' }),
    updateNote: vi.fn().mockResolvedValue({ id: 1, title: 'updated', content: '' }),
    deleteNote: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('noteStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', async () => {
    const { useNoteStore } = await import('../noteStore');
    const state = useNoteStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.tags).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should have fetchTags action', async () => {
    const { useNoteStore } = await import('../noteStore');
    const state = useNoteStore.getState();
    expect(typeof state.fetchTags).toBe('function');
  });

  it('should have fetchNotes action', async () => {
    const { useNoteStore } = await import('../noteStore');
    const state = useNoteStore.getState();
    expect(typeof state.fetchNotes).toBe('function');
  });

  it('should have CRUD actions for tags', async () => {
    const { useNoteStore } = await import('../noteStore');
    const state = useNoteStore.getState();
    expect(typeof state.addTag).toBe('function');
    expect(typeof state.updateTag).toBe('function');
    expect(typeof state.deleteTag).toBe('function');
  });

  it('should have CRUD actions for notes', async () => {
    const { useNoteStore } = await import('../noteStore');
    const state = useNoteStore.getState();
    expect(typeof state.addNote).toBe('function');
    expect(typeof state.updateNote).toBe('function');
    expect(typeof state.deleteNote).toBe('function');
  });
});
