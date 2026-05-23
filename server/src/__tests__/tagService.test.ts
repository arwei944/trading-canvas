import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database;
let testDbPath: string;

beforeAll(() => {
  testDbPath = path.join('/tmp', `test_trading_${Date.now()}.db`);
  db = new Database(testDbPath);

  // 创建测试表
  db.exec(`
    CREATE TABLE IF NOT EXISTS trade_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#666666',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    );
    CREATE TABLE IF NOT EXISTS note_tags (
      note_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (note_id, tag_id)
    );
    CREATE TABLE IF NOT EXISTS trade_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    );
  `);
});

afterEach(() => {
  db.exec('DELETE FROM note_tags');
  db.exec('DELETE FROM trade_notes');
  db.exec('DELETE FROM trade_tags');
});

afterAll(() => {
  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});

describe('TagService', () => {
  it('should add a tag', () => {
    const stmt = db.prepare('INSERT INTO trade_tags (name, color) VALUES (?, ?)');
    const result = stmt.run('测试标签', '#ff0000');
    expect(result.changes).toBe(1);
  });

  it('should get tags with note count', () => {
    db.prepare('INSERT INTO trade_tags (name, color) VALUES (?, ?)').run('标签A', '#111');
    db.prepare('INSERT INTO trade_tags (name, color) VALUES (?, ?)').run('标签B', '#222');

    const tags = db.prepare(`
      SELECT t.*, COUNT(nt.tag_id) as noteCount
      FROM trade_tags t
      LEFT JOIN note_tags nt ON t.id = nt.tag_id
      GROUP BY t.id
    `).all();

    expect(tags).toHaveLength(2);
    expect(tags[0].noteCount).toBe(0);
  });

  it('should update a tag', () => {
    db.prepare('INSERT INTO trade_tags (name, color) VALUES (?, ?)').run('旧名称', '#000');
    const tag = db.prepare('SELECT * FROM trade_tags WHERE name = ?').get('旧名称') as any;

    db.prepare('UPDATE trade_tags SET name = ?, color = ? WHERE id = ?').run('新名称', '#fff', tag.id);
    const updated = db.prepare('SELECT * FROM trade_tags WHERE id = ?').get(tag.id) as any;
    expect(updated.name).toBe('新名称');
    expect(updated.color).toBe('#fff');
  });

  it('should delete a tag', () => {
    db.prepare('INSERT INTO trade_tags (name, color) VALUES (?, ?)').run('待删除', '#000');
    const tag = db.prepare('SELECT * FROM trade_tags WHERE name = ?').get('待删除') as any;

    db.prepare('DELETE FROM trade_tags WHERE id = ?').run(tag.id);
    const result = db.prepare('SELECT * FROM trade_tags WHERE id = ?').get(tag.id);
    expect(result).toBeUndefined();
  });
});

describe('NoteService', () => {
  it('should add a note with tags', () => {
    db.prepare('INSERT INTO trade_tags (name, color) VALUES (?, ?)').run('标签1', '#111');
    const tag = db.prepare('SELECT * FROM trade_tags WHERE name = ?').get('标签1') as any;

    const result = db.prepare('INSERT INTO trade_notes (title, content) VALUES (?, ?)').run('测试笔记', '测试内容');
    const noteId = result.lastInsertRowid as number;

    db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(noteId, tag.id);

    const note = db.prepare('SELECT * FROM trade_notes WHERE id = ?').get(noteId) as any;
    expect(note.title).toBe('测试笔记');
  });

  it('should update a note', () => {
    const result = db.prepare('INSERT INTO trade_notes (title, content) VALUES (?, ?)').run('原标题', '原内容');
    const noteId = result.lastInsertRowid as number;

    db.prepare('UPDATE trade_notes SET title = ?, content = ?, updated_at = ? WHERE id = ?')
      .run('新标题', '新内容', Date.now(), noteId);

    const note = db.prepare('SELECT * FROM trade_notes WHERE id = ?').get(noteId) as any;
    expect(note.title).toBe('新标题');
  });

  it('should delete a note', () => {
    const result = db.prepare('INSERT INTO trade_notes (title, content) VALUES (?, ?)').run('待删除笔记', '');
    const noteId = result.lastInsertRowid as number;

    db.prepare('DELETE FROM trade_notes WHERE id = ?').run(noteId);
    expect(db.prepare('SELECT * FROM trade_notes WHERE id = ?').get(noteId)).toBeUndefined();
  });
});
