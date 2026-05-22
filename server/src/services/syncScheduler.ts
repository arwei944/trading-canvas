import cron from 'node-cron';
import { syncAllApis } from './dataSyncService.js';

let scheduledTask: cron.ScheduledTask | null = null;

export function startSyncScheduler(): void {
  const interval = process.env.SYNC_INTERVAL_MINUTES || '5';

  // 验证 cron 表达式
  const cronExpr = `*/${interval} * * * *`;
  if (!cron.validate(cronExpr)) {
    console.error(`[Sync] Invalid cron expression: ${cronExpr}`);
    return;
  }

  scheduledTask = cron.schedule(cronExpr, async () => {
    console.log(`[Sync] Starting scheduled sync...`);
    try {
      const result = await syncAllApis();
      console.log(`[Sync] Scheduled sync completed: ${result.success} success, ${result.failed} failed`);
    } catch (err) {
      console.error(`[Sync] Scheduled sync failed:`, err);
    }
  });

  console.log(`[Sync] Scheduler started (every ${interval} minutes)`);
}

export function stopSyncScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('[Sync] Scheduler stopped');
  }
}
