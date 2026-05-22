import { getDb } from '../db/index.js';
import type { TagItem } from './tagService.js';

// ============ 类型定义 ============

export interface NoteItem {
  id: number;
  title: string;
  content: string;
  created_at: number;
  updated_at: number;
  tags: TagItem[];
}

// ============ 辅助函数 ============

function getTagsForNote(db: any, noteId: number): TagItem[] {
  const rows = db.prepare(`
    SELECT t.id, t.name, t.color, t.created_at, COUNT(nt2.tag_id) AS noteCount
    FROM note_tags nt
    JOIN trade_tags t ON nt.tag_id = t.id
    LEFT JOIN note_tags nt2 ON t.id = nt2.tag_id
    WHERE nt.note_id = ?
    GROUP BY t.id
  `).all(noteId) as any[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    created_at: row.created_at,
    noteCount: row.noteCount || 0,
  }));
}

function setNoteTags(db: any, noteId: number, tagIds: number[]): void {
  db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(noteId);
  if (tagIds.length > 0) {
    const insert = db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');
    for (const tagId of tagIds) {
      insert.run(noteId, tagId);
    }
  }
}

// ============ 笔记 CRUD ============

export function getNotes(): NoteItem[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM trade_notes ORDER BY updated_at DESC').all() as any[];
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: getTagsForNote(db, row.id),
  }));
}

export function getNoteById(id: number): NoteItem | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM trade_notes WHERE id = ?').get(id) as any;
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: getTagsForNote(db, row.id),
  };
}

export function addNote(data: { title: string; content: string; tagIds?: number[] }): NoteItem {
  const db = getDb();
  const now = Date.now();

  const result = db.prepare(`
    INSERT INTO trade_notes (title, content, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(data.title, data.content, now, now);

  const noteId = result.lastInsertRowid as number;

  if (data.tagIds && data.tagIds.length > 0) {
    setNoteTags(db, noteId, data.tagIds);
  }

  return {
    id: noteId,
    title: data.title,
    content: data.content,
    created_at: now,
    updated_at: now,
    tags: getTagsForNote(db, noteId),
  };
}

export function updateNote(id: number, data: { title?: string; content?: string; tagIds?: number[] }): NoteItem | null {
  const db = getDb();

  const existing = db.prepare('SELECT * FROM trade_notes WHERE id = ?').get(id) as any;
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const content = data.content ?? existing.content;
  const now = Date.now();

  db.prepare('UPDATE trade_notes SET title = ?, content = ?, updated_at = ? WHERE id = ?')
    .run(title, content, now, id);

  if (data.tagIds !== undefined) {
    setNoteTags(db, id, data.tagIds);
  }

  return {
    id,
    title,
    content,
    created_at: existing.created_at,
    updated_at: now,
    tags: getTagsForNote(db, id),
  };
}

export function deleteNote(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM trade_notes WHERE id = ?').run(id);
  return result.changes > 0;
}
