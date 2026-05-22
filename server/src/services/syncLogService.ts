import { getDb } from '../db/index.js';

export interface SyncLog {
  id: number;
  api_id: number;
  sync_type: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  started_at: number;
  finished_at: number | null;
  records_synced: number;
  error_message: string | null;
}

// 创建同步日志
export function createSyncLog(apiId: number, syncType = 'full'): number {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO sync_logs (api_id, sync_type, status, started_at) VALUES (?, ?, ?, ?)'
  ).run(apiId, syncType, 'running', Date.now());
  return result.lastInsertRowid as number;
}

// 更新同步日志状态
export function updateSyncLog(
  logId: number,
  data: { status: string; finished_at?: number; records_synced?: number; error_message?: string }
) {
  const db = getDb();
  const updates: string[] = [];
  const values: any[] = [];

  if (data.status) { updates.push('status = ?'); values.push(data.status); }
  if (data.finished_at !== undefined) { updates.push('finished_at = ?'); values.push(data.finished_at); }
  if (data.records_synced !== undefined) { updates.push('records_synced = ?'); values.push(data.records_synced); }
  if (data.error_message !== undefined) { updates.push('error_message = ?'); values.push(data.error_message); }

  if (updates.length === 0) return;
  values.push(logId);
  db.prepare(`UPDATE sync_logs SET ${updates.join(', ')} WHERE id = ?`).run(...values);
}

// 获取同步日志
export function getSyncLogs(apiId?: number, limit = 20): SyncLog[] {
  const db = getDb();
  if (apiId) {
    return db.prepare(
      'SELECT * FROM sync_logs WHERE api_id = ? ORDER BY started_at DESC LIMIT ?'
    ).all(apiId, limit) as SyncLog[];
  }
  return db.prepare(
    'SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT ?'
  ).all(limit) as SyncLog[];
}

// 获取最新同步状态
export function getLatestSyncStatus(apiId?: number): SyncLog | null {
  const db = getDb();
  if (apiId) {
    return db.prepare(
      'SELECT * FROM sync_logs WHERE api_id = ? ORDER BY started_at DESC LIMIT 1'
    ).get(apiId) as SyncLog | null;
  }
  return db.prepare(
    'SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 1'
  ).get() as SyncLog | null;
}
