import { getDb } from '../db/index.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { createExchange } from '../adapters/exchangeAdapter.js';
import type { ExchangeApi, ExchangeInfo, ExchangeName } from '../types.js';
import { success, fail } from '../utils/response.js';

// ============ API 管理 ============

export function getExchangeList(): ExchangeInfo[] {
  const db = getDb();

  const exchanges: ExchangeName[] = db.prepare('SELECT * FROM exchange_names').all() as ExchangeName[];

  return exchanges.map(ex => {
    const apis = db.prepare(
      'SELECT id, exchange_id, name, star, status, created_at, updated_at FROM exchange_apis WHERE exchange_id = ? AND status = 1'
    ).all(ex.id) as ExchangeApi[];

    return {
      exchangeName: ex.name,
      exchangeLogo: ex.logo || '',
      exchangeId: ex.id,
      exSize: apis.length,
      apis,
    };
  });
}

export function addExchangeApi(data: {
  exchange_id: number;
  name: string;
  api_key: string;
  secret_key: string;
  passphrase?: string;
}): ExchangeApi {
  const db = getDb();
  const now = Date.now();

  const result = db.prepare(`
    INSERT INTO exchange_apis (exchange_id, name, api_key, secret_key, passphrase, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.exchange_id,
    data.name,
    encrypt(data.api_key),
    encrypt(data.secret_key),
    data.passphrase ? encrypt(data.passphrase) : null,
    now
  );

  return {
    id: result.lastInsertRowid as number,
    exchange_id: data.exchange_id,
    name: data.name,
    api_key: '',
    secret_key: '',
    passphrase: undefined,
    star: 0,
    status: 1,
    created_at: now,
    updated_at: null,
  };
}

export function deleteExchangeApi(apiId: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM exchange_apis WHERE id = ?').run(apiId);
  return result.changes > 0;
}

export function toggleStar(apiId: number): void {
  const db = getDb();
  db.prepare('UPDATE exchange_apis SET star = CASE WHEN star = 1 THEN 0 ELSE 1 END WHERE id = ?').run(apiId);
}

export function getDecryptedApi(apiId: number): ExchangeApi | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM exchange_apis WHERE id = ?').get(apiId) as any;
  if (!row) return null;

  return {
    ...row,
    api_key: decrypt(row.api_key),
    secret_key: decrypt(row.secret_key),
    passphrase: row.passphrase ? decrypt(row.passphrase) : undefined,
  };
}

export function getAllApis(): ExchangeApi[] {
  const db = getDb();
  return db.prepare('SELECT * FROM exchange_apis WHERE status = 1').all() as ExchangeApi[];
}
