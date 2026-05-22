import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const dbPath = process.env.DB_PATH || './data/trading-canvas.db';
  const dir = path.dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // 创建表
  createTables(db);

  console.log(`📦 Database initialized at ${dbPath}`);
}

function createTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exchange_names (
      id   INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      logo TEXT
    );

    CREATE TABLE IF NOT EXISTS exchange_apis (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      exchange_id INTEGER NOT NULL,
      name        TEXT NOT NULL,
      api_key     TEXT NOT NULL,
      secret_key  TEXT NOT NULL,
      passphrase  TEXT,
      star        INTEGER DEFAULT 0,
      status      INTEGER DEFAULT 1,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER,
      FOREIGN KEY (exchange_id) REFERENCES exchange_names(id)
    );

    CREATE TABLE IF NOT EXISTS asset_snapshots (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      api_id          INTEGER NOT NULL,
      date            TEXT NOT NULL,
      total_asset_usd REAL NOT NULL DEFAULT 0,
      created_at      INTEGER NOT NULL,
      UNIQUE(api_id, date),
      FOREIGN KEY (api_id) REFERENCES exchange_apis(id)
    );

    CREATE TABLE IF NOT EXISTS trade_tags (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      color      TEXT NOT NULL DEFAULT '#007AFF',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trade_notes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT NOT NULL,
      content    TEXT DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS note_tags (
      note_id INTEGER NOT NULL,
      tag_id  INTEGER NOT NULL,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (note_id) REFERENCES trade_notes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES trade_tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 初始数据
  const count = db.prepare('SELECT COUNT(*) as count FROM exchange_names').get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO exchange_names (id, name, logo) VALUES (?, ?, ?)');
    const exchanges = [
      [1, 'Binance', 'https://cdn-static.hugging.com/static/hg/binance.jpg'],
      [2, 'OKX', 'https://cdn-static.hugging.com/static/hg/okx.png'],
      [3, 'Bybit', 'https://cdn-static.hugging.com/static/hg/bybit.png'],
      [4, 'Bitget', 'https://cdn-static.hugging.com/static/hg/bitget.png'],
      [6, 'Gate.io', 'https://cdn-static.hugging.com/static/hg/gate.png'],
      [8, 'Huobi', 'https://cdn-static.hugging.com/static/hg/huobi.png'],
    ];
    for (const [id, name, logo] of exchanges) {
      insert.run(id, name, logo);
    }
  }
}
