import { getDb } from '../db/index.js';

// ============ 类型定义 ============

export interface TagItem {
  id: number;
  name: string;
  color: string;
  created_at: number;
  noteCount: number;
}

// ============ 标签 CRUD ============

export function getTags(): TagItem[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT t.id, t.name, t.color, t.created_at, COUNT(nt.tag_id) AS noteCount
    FROM trade_tags t
    LEFT JOIN note_tags nt ON t.id = nt.tag_id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `).all() as any[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    created_at: row.created_at,
    noteCount: row.noteCount || 0,
  }));
}

export function addTag(data: { name: string; color: string }): TagItem {
  const db = getDb();
  const now = Date.now();

  const result = db.prepare(`
    INSERT INTO trade_tags (name, color, created_at)
    VALUES (?, ?, ?)
  `).run(data.name, data.color, now);

  return {
    id: result.lastInsertRowid as number,
    name: data.name,
    color: data.color,
    created_at: now,
    noteCount: 0,
  };
}

export function updateTag(id: number, data: { name?: string; color?: string }): TagItem | null {
  const db = getDb();

  const existing = db.prepare('SELECT * FROM trade_tags WHERE id = ?').get(id) as any;
  if (!existing) return null;

  const name = data.name ?? existing.name;
  const color = data.color ?? existing.color;

  db.prepare('UPDATE trade_tags SET name = ?, color = ? WHERE id = ?').run(name, color, id);

  const noteCount = (db.prepare('SELECT COUNT(*) AS cnt FROM note_tags WHERE tag_id = ?').get(id) as any).cnt || 0;

  return {
    id,
    name,
    color,
    created_at: existing.created_at,
    noteCount,
  };
}

export function deleteTag(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM trade_tags WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getTagsByNoteId(noteId: number): TagItem[] {
  const db = getDb();
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
