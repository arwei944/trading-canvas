import { getDb } from '../db/index.js';

// ============ 设置 KV CRUD ============

export function getSettings(): Record<string, string> {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM app_settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export function getSetting(key: string): string | null {
  const db = getDb();
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO app_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

export function deleteSetting(key: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM app_settings WHERE key = ?').run(key);
  return result.changes > 0;
}

export function batchSetSettings(settings: Record<string, string>): void {
  const db = getDb();
  const upsert = db.prepare(`
    INSERT INTO app_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(settings)) {
      upsert.run(key, value);
    }
  });
  transaction();
}
