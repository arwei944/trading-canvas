import ccxt from 'ccxt';
import { getDb } from '../db/index.js';
import { createExchange, getExchangeName } from '../adapters/exchangeAdapter.js';
import { getDecryptedApi, getAllApis } from './exchangeService.js';
import type {
  AssetBalance,
  AssetResponse,
  PagedAssets,
  PositionData,
  OrderData,
  DepositWithdrawStats,
  CalendarData,
  AccountType,
  HistoryOrder,
} from '../types.js';

// ============ 同步状态管理 ============

const syncState = new Map<number, { state: number; ratio: number }>();

export async function getSyncState(apiId: number): Promise<Record<string, any>> {
  const { getLatestSyncStatus } = await import('./syncLogService.js');
  const latest = getLatestSyncStatus(apiId);

  if (!latest) {
    return { isSyncing: false, lastSyncTime: null, status: 'idle' };
  }

  return {
    isSyncing: latest.status === 'running',
    lastSyncTime: latest.started_at,
    status: latest.status,
    recordsSynced: latest.records_synced,
    errorMessage: latest.error_message,
  };
}

function setSyncState(apiId: number, state: number, ratio: number): void {
  syncState.set(apiId, { state, ratio });
}

// ============ 辅助函数 ============

/** 获取今天日期字符串 YYYY-MM-DD */
function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/** 创建空的 PagedAssets */
function createEmptyPagedAssets(pageNum: number, pageSize: number): PagedAssets {
  return { total: 0, pageSize, list: [], pageNum };
}

/** 创建空的 AssetResponse */
function createEmptyAssetResponse(page: number, pageSize: number): AssetResponse {
  return {
    ALL: createEmptyPagedAssets(page, pageSize),
    SPOT: createEmptyPagedAssets(page, pageSize),
    MARGIN: createEmptyPagedAssets(page, pageSize),
    LENDING: createEmptyPagedAssets(page, pageSize),
    FUTURES: createEmptyPagedAssets(page, pageSize),
    FUNDING: createEmptyPagedAssets(page, pageSize),
    EARN: createEmptyPagedAssets(page, pageSize),
  };
}

/** 根据余额类型推断资产类型 */
function inferAccountType(_exchangeId: number, _currency: string, balanceType: string): AccountType {
  switch (balanceType) {
    case 'future':
    case 'swap':
    case 'contract':
      return 'FUTURES';
    case 'margin':
      return 'MARGIN';
    case 'funding':
      return 'FUNDING';
    case 'earn':
    case 'lending':
    case 'savings':
      return 'EARN';
    case 'spot':
    default:
      return 'SPOT';
  }
}

/** 获取交易所 Logo */
function getExchangeLogo(exchangeId: number): string {
  const logos: Record<number, string> = {
    1: 'https://cdn-static.hugging.com/static/hg/binance.jpg',
    2: 'https://cdn-static.hugging.com/static/hg/okx.png',
    3: 'https://cdn-static.hugging.com/static/hg/bybit.png',
    4: 'https://cdn-static.hugging.com/static/hg/bitget.png',
    6: 'https://cdn-static.hugging.com/static/hg/gate.png',
    8: 'https://cdn-static.hugging.com/static/hg/huobi.png',
  };
  return logos[exchangeId] || '';
}

/** 获取币种 Logo URL（使用 CryptoCompare 等公开图标服务） */
function getSymbolLogo(symbol: string): string | null {
  return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}

/** 安全调用 ccxt 方法 */
async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    console.error(`[DataSync] ccxt call failed: ${err.message}`);
    return fallback;
  }
}

// ============ 核心数据拉取方法 ============

/**
 * 获取 BTC/ETH 价格（公开接口，无需 API Key）
 */
export async function getBTCETHPrice(): Promise<{ btcPrice: number; ethPrice: number }> {
  try {
    const binance = new ccxt.binance({ enableRateLimit: true });
    const [btcTicker, ethTicker] = await Promise.all([
      binance.fetchTicker('BTC/USDT'),
      binance.fetchTicker('ETH/USDT'),
    ]);
    return {
      btcPrice: btcTicker.last || 0,
      ethPrice: ethTicker.last || 0,
    };
  } catch (err: any) {
    console.error('[DataSync] Failed to fetch BTC/ETH price:', err.message);
    return { btcPrice: 0, ethPrice: 0 };
  }
}

/**
 * 获取资产余额
 * 通过 ccxt fetchBalance 获取，转换为前端期望的 AssetResponse 格式
 */
export async function getAssets(
  apiId: number,
  page = 1,
  pageSize = 10
): Promise<AssetResponse> {
  const api = getDecryptedApi(apiId);
  if (!api) {
    return createEmptyAssetResponse(page, pageSize);
  }

  const exchange = createExchange(api);

  // 拉取现货余额（默认）
  const spotBalance = await safeCall(
    () => exchange.fetchBalance(),
    { total: {}, free: {}, used: {}, info: {} } as any
  );

  // 尝试获取合约余额
  const futuresBalance = await safeCall(
    () => exchange.fetchBalance({ type: 'swap' }),
    { total: {}, free: {}, used: {}, info: {} } as any
  );

  // 处理余额数据，返回带类型的币种列表
  const processBalances = (balance: any, balanceType: string) => {
    const totalBalances = balance.total || {};
    return Object.entries(totalBalances)
      .filter(([, amount]) => amount > 0)
      .map(([currency, amount]) => ({
        currency,
        amount: amount as number,
        type: inferAccountType(api.exchange_id, currency, balanceType),
      }));
  };

  const spotItems = processBalances(spotBalance, 'spot');
  const futuresItems = processBalances(futuresBalance, 'swap');

  // 合并所有余额项（同一币种在现货和合约都有时，保留两者）
  const allItems = [...spotItems];
  for (const fi of futuresItems) {
    allItems.push(fi);
  }

  if (allItems.length === 0) {
    return createEmptyAssetResponse(page, pageSize);
  }

  // 获取价格信息（批量获取主要交易对）
  const priceMap = new Map<string, number>();
  const priceChangeMap = new Map<string, { change24h: number; changePercent24h: number }>();

  // 收集需要查询价格的币种（去重）
  const allCurrencies = [...new Set(allItems.map(item => item.currency))];

  await safeCall(async () => {
    // 尝试批量获取价格
    const symbols = allCurrencies
      .filter(c => c !== 'USDT' && c !== 'USDC')
      .map(c => `${c}/USDT`);

    // 分批获取，避免请求过多
    const batchSize = 10;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const tickers = await Promise.allSettled(
        batch.map(s => exchange.fetchTicker(s))
      );
      tickers.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value) {
          const currency = batch[idx].split('/')[0];
          priceMap.set(currency, result.value.last || 0);
          priceChangeMap.set(currency, {
            change24h: result.value.change || 0,
            changePercent24h: result.value.percentage || 0,
          });
        }
      });
    }
  }, undefined);

  // USDT 和 USDC 价格为 1
  priceMap.set('USDT', 1);
  priceMap.set('USDC', 1);
  priceMap.set('BUSD', 1);

  // 构建资产列表
  const now = Date.now();
  const assetBalances: AssetBalance[] = allItems.map(({ currency, amount, type }) => {
    const price = priceMap.get(currency) || 0;
    const usdValuation = price * amount;
    const priceInfo = priceChangeMap.get(currency) || { change24h: 0, changePercent24h: 0 };

    return {
      radio: 0, // 后续计算占比
      price,
      asset: currency,
      symbolLogo: getSymbolLogo(currency),
      amount: String(amount),
      usdValuation,
      type,
      updateTime: now,
      exApiId: apiId,
      priceChange24H: priceInfo.change24h,
      priceChangePercent24H: priceInfo.changePercent24h,
      assetUsdChange24H: null,
      assetUsdChange7D: null,
      assetUsdChange30D: null,
      assetUsdChange90D: null,
    };
  });

  // 计算占比
  const totalUsd = assetBalances.reduce((sum, a) => sum + a.usdValuation, 0);
  assetBalances.forEach(a => {
    a.radio = totalUsd > 0 ? a.usdValuation / totalUsd : 0;
  });

  // 按美元估值降序排列
  assetBalances.sort((a, b) => b.usdValuation - a.usdValuation);

  // 分页
  const total = assetBalances.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedList = assetBalances.slice(start, end);

  // 构建按类型分组的数据
  const allPaged: PagedAssets = { total, pageSize, list: pagedList, pageNum: page };

  // 按类型分组
  const byType = new Map<AccountType, AssetBalance[]>();
  for (const type of ['SPOT', 'MARGIN', 'FUTURES', 'FUNDING', 'EARN', 'LENDING'] as AccountType[]) {
    byType.set(type, []);
  }
  assetBalances.forEach(a => {
    const t = a.type || 'SPOT';
    byType.get(t)!.push(a);
  });

  function paginateList(list: AssetBalance[]): PagedAssets {
    return {
      total: list.length,
      pageSize,
      list: list.slice(start, end),
      pageNum: page,
    };
  }

  return {
    ALL: allPaged,
    SPOT: paginateList(byType.get('SPOT')!),
    MARGIN: paginateList(byType.get('MARGIN')!),
    LENDING: paginateList(byType.get('LENDING')!),
    FUTURES: paginateList(byType.get('FUTURES')!),
    FUNDING: paginateList(byType.get('FUNDING')!),
    EARN: paginateList(byType.get('EARN')!),
  };
}

/**
 * 获取资产分布（用于饼图）
 */
export async function getAssetRatio(apiId: number): Promise<{ ALL: AssetBalance[] }> {
  const response = await getAssets(apiId, 1, 100);
  return { ALL: response.ALL.list };
}

/**
 * 获取合约持仓
 */
export async function getPositions(apiId: number): Promise<PositionData[]> {
  const api = getDecryptedApi(apiId);
  if (!api) return [];

  const exchange = createExchange(api);
  const exchangeName = getExchangeName(api.exchange_id);

  const positions = await safeCall(
    () => exchange.fetchPositions(),
    [] as any[]
  );

  return positions
    .filter((p: any) => p && parseFloat(p.contracts || p.positionAmt || 0) !== 0)
    .map((p: any) => {
      const amount = Math.abs(parseFloat(p.contracts || p.positionAmt || 0));
      const side = (p.side || (parseFloat(p.positionAmt || 0) >= 0 ? 'long' : 'short')).toUpperCase();

      return {
        positionId: String(p.id || ''),
        symbol: p.symbol || '',
        exchangeName,
        side: side === 'LONG' ? 'LONG' : side === 'SHORT' ? 'SHORT' : 'BOTH',
        amount,
        avgPrice: parseFloat(p.entryPrice || p.avgPrice || 0),
        markPrice: parseFloat(p.markPrice || 0),
        liquidationPrice: parseFloat(p.liquidationPrice || 0),
        unrealizedPnl: parseFloat(p.unrealizedPnl || 0),
        roi: parseFloat(p.percentage || p.roi || 0),
        leverage: parseFloat(p.leverage || 1),
        margin: parseFloat(p.initialMargin || p.collateral || 0),
        isolatedMargin: parseFloat(p.initialMargin || 0),
      };
    });
}

/**
 * 获取当前委托
 */
export async function getOrders(apiId: number): Promise<OrderData[]> {
  const api = getDecryptedApi(apiId);
  if (!api) return [];

  const exchange = createExchange(api);
  const exchangeName = getExchangeName(api.exchange_id);

  const orders = await safeCall(
    () => exchange.fetchOpenOrders(),
    [] as any[]
  );

  return orders.map((o: any) => {
    const status = o.status === 'open' ? 0
      : o.status === 'partial' ? 1
      : o.status === 'closed' ? 2
      : o.status === 'canceled' ? 3
      : 4;

    return {
      orderId: String(o.id || ''),
      symbol: o.symbol || '',
      exchangeName,
      side: (o.side || 'buy').toUpperCase(),
      type: (o.type || 'limit').toUpperCase().replace('-', '_'),
      price: o.price ? parseFloat(o.price) : null,
      amount: parseFloat(o.amount || o.remaining || 0),
      origQty: parseFloat(o.amount || 0),
      executedQty: parseFloat(o.filled || 0),
      avgPrice: o.average ? parseFloat(o.average) : null,
      cummulativeQuoteQty: parseFloat(o.cost || 0),
      dealCash: parseFloat(o.cost || 0),
      status,
      time: o.lastTradeTimestamp || o.timestamp || Date.now(),
      createTime: o.timestamp || Date.now(),
    };
  });
}

/**
 * 获取充提统计
 * 从 asset_snapshots 表计算
 */
export async function getDepositWithdrawStats(apiId: number): Promise<DepositWithdrawStats> {
  const db = getDb();
  const today = getTodayStr();

  // 获取当前总资产
  const currentRow = db
    .prepare('SELECT total_asset_usd FROM asset_snapshots WHERE api_id = ? ORDER BY date DESC LIMIT 1')
    .get(apiId) as { total_asset_usd: number } | undefined;

  // 获取最早的总资产
  const firstRow = db
    .prepare('SELECT total_asset_usd FROM asset_snapshots WHERE api_id = ? ORDER BY date ASC LIMIT 1')
    .get(apiId) as { total_asset_usd: number } | undefined;

  // 获取昨天的总资产（用于计算 24h 变化）
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const yesterdayRow = db
    .prepare('SELECT total_asset_usd FROM asset_snapshots WHERE api_id = ? AND date = ?')
    .get(apiId, yesterday) as { total_asset_usd: number } | undefined;

  const assetsBalance = currentRow?.total_asset_usd || 0;
  const firstBalance = firstRow?.total_asset_usd || 0;
  const yesterdayBalance = yesterdayRow?.total_asset_usd || 0;

  const overallPnl = assetsBalance - firstBalance;
  const overallPnlPercent = firstBalance > 0 ? (overallPnl / firstBalance) * 100 : 0;
  const assetsBalance24HChange = assetsBalance - yesterdayBalance;

  // 获取 BTC 价格
  let btcPrice = 0;
  try {
    const prices = await getBTCETHPrice();
    btcPrice = prices.btcPrice;
  } catch {
    // 获取失败不影响其他数据
  }

  // 获取合约未实现盈亏
  let futuresPnl = 0;
  try {
    const positions = await getPositions(apiId);
    futuresPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    futuresPnl = Math.round(futuresPnl * 100) / 100;
  } catch {
    // 获取失败不影响其他数据
  }

  // TODO: totalDeposit/totalWithdraw 需要交易所特定的充提历史 API
  // 各交易所充提接口不统一，暂时使用首次快照值作为初始充值的近似值
  const totalDeposit = firstBalance > 0 ? firstBalance : 0;
  const totalWithdraw = 0;

  return {
    totalDeposit,
    totalWithdraw,
    totalDepositBtcValuation: btcPrice > 0 ? Math.round((totalDeposit / btcPrice) * 10000) / 10000 : 0,
    totalWithdrawBtcValuation: 0,
    overallPnl,
    overallPnlPercent,
    futuresPnl,
    assetsBalance,
    assetsBalance24HChange,
  };
}

/**
 * 获取趋势图数据
 * 从 asset_snapshots 表读取
 */
export function getTrendChart(
  apiId: number,
  interval: '24h' | '7d' | '30d' | '90d' = '30d'
): Array<{ date: number; asset: number }> {
  const db = getDb();

  // 根据间隔计算起始日期
  const now = new Date();
  let daysBack: number;
  switch (interval) {
    case '24h': daysBack = 1; break;
    case '7d': daysBack = 7; break;
    case '30d': daysBack = 30; break;
    case '90d': daysBack = 90; break;
    default: daysBack = 30;
  }

  const startDate = new Date(now.getTime() - daysBack * 86400000)
    .toISOString()
    .split('T')[0];

  const rows = db
    .prepare(
      'SELECT date, total_asset_usd FROM asset_snapshots WHERE api_id = ? AND date >= ? ORDER BY date ASC'
    )
    .all(apiId, startDate) as Array<{ date: string; total_asset_usd: number }>;

  return rows.map(row => ({
    date: new Date(row.date).getTime(),
    asset: row.total_asset_usd,
  }));
}

/**
 * 获取按日期的资产变动
 */
export function getAssetChangeByDate(
  beginTime: number,
  endTime: number
): Record<string, number> {
  const db = getDb();

  const startDate = new Date(beginTime).toISOString().split('T')[0];
  const endDate = new Date(endTime).toISOString().split('T')[0];

  const rows = db
    .prepare(
      `SELECT date, total_asset_usd FROM asset_snapshots
       WHERE date >= ? AND date <= ?
       ORDER BY date ASC`
    )
    .all(startDate, endDate) as Array<{ date: string; total_asset_usd: number }>;

  const result: Record<string, number> = {};
  for (let i = 1; i < rows.length; i++) {
    const change = rows[i].total_asset_usd - rows[i - 1].total_asset_usd;
    result[rows[i].date] = Math.round(change * 100) / 100;
  }

  return result;
}

/**
 * 获取日历盈亏数据
 * 从 asset_snapshots 表计算每日变动
 */
export function getCalendar(year: number, month: number): CalendarData[] {
  const db = getDb();

  // 获取该月所有 API 的快照数据
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // 获取前一天的快照（用于计算月初第一天的变动）
  const prevMonthLastDay = new Date(year, month - 1, 0).toISOString().split('T')[0];

  const rows = db
    .prepare(
      `SELECT api_id, date, total_asset_usd FROM asset_snapshots
       WHERE date >= ? AND date <= ?
       ORDER BY date ASC`
    )
    .all(prevMonthLastDay, endDate) as Array<{ api_id: number; date: string; total_asset_usd: number }>;

  // 按 api_id 分组
  const byApi = new Map<number, Map<string, number>>();
  for (const row of rows) {
    if (!byApi.has(row.api_id)) {
      byApi.set(row.api_id, new Map());
    }
    byApi.get(row.api_id)!.set(row.date, row.total_asset_usd);
  }

  // 计算每日变动
  const result: CalendarData[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let dailyPnl = 0;
    let count = 0;

    for (const [, dateMap] of byApi) {
      const currentVal = dateMap.get(date);
      // 获取前一天的数据
      const prevDate = new Date(year, month - 1, day).toISOString().split('T')[0];
      const prevVal = dateMap.get(prevDate);

      if (currentVal !== undefined && prevVal !== undefined) {
        dailyPnl += currentVal - prevVal;
        count++;
      } else if (currentVal !== undefined) {
        // 没有前一天数据，只计入有数据的 API
        count++;
      }
    }

    result.push({
      date,
      pnl: Math.round(dailyPnl * 100) / 100,
      count,
    });
  }

  return result;
}

/**
 * 获取分析摘要
 */
export function getAnalysisSummary(
  startDate: number,
  endDate: number
): Record<string, unknown> {
  const db = getDb();
  const start = new Date(startDate).toISOString().split('T')[0];
  const end = new Date(endDate).toISOString().split('T')[0];

  // 获取该时间段内的资产快照
  const rows = db
    .prepare(
      `SELECT api_id, date, total_asset_usd FROM asset_snapshots
       WHERE date >= ? AND date <= ?
       ORDER BY date ASC`
    )
    .all(start, end) as Array<{ api_id: number; date: string; total_asset_usd: number }>;

  if (rows.length === 0) {
    return {
      totalPnl: 0,
      maxBalance: 0,
      minBalance: 0,
      avgBalance: 0,
      tradingDays: 0,
    };
  }

  const balances = rows.map(r => r.total_asset_usd);
  const totalPnl = balances.length >= 2
    ? balances[balances.length - 1] - balances[0]
    : 0;

  return {
    totalPnl: Math.round(totalPnl * 100) / 100,
    maxBalance: Math.round(Math.max(...balances) * 100) / 100,
    minBalance: Math.round(Math.min(...balances) * 100) / 100,
    avgBalance: Math.round((balances.reduce((a, b) => a + b, 0) / balances.length) * 100) / 100,
    tradingDays: new Set(rows.map(r => r.date)).size,
  };
}

// ============ 数据同步方法 ============

/**
 * 同步单个 API 的数据
 * 拉取余额并写入 asset_snapshots
 */
export async function syncApiData(apiId: number): Promise<void> {
  const api = getDecryptedApi(apiId);
  if (!api) {
    throw new Error(`API ${apiId} not found`);
  }

  setSyncState(apiId, 1, 0); // 同步中

  // 创建同步日志
  const { createSyncLog, updateSyncLog } = await import('./syncLogService.js');
  const logId = createSyncLog(apiId, 'full');

  try {
    const exchange = createExchange(api);
    const balance = await exchange.fetchBalance();
    const totalBalances = balance.total || {};

    // 计算总资产（USD 估值）
    let totalUsd = 0;
    const nonStablecoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FDUSD'];

    // 先获取价格
    const currenciesToPrice = Object.entries(totalBalances)
      .filter(([currency, amount]) => amount > 0 && !nonStablecoins.includes(currency))
      .map(([currency]) => currency);

    const priceMap = new Map<string, number>();

    // 批量获取价格
    const batchSize = 10;
    for (let i = 0; i < currenciesToPrice.length; i += batchSize) {
      const batch = currenciesToPrice.slice(i, i + batchSize);
      const tickers = await Promise.allSettled(
        batch.map(c => exchange.fetchTicker(`${c}/USDT`))
      );
      tickers.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value) {
          priceMap.set(batch[idx], result.value.last || 0);
        }
      });
      setSyncState(apiId, 1, Math.min(((i + batchSize) / currenciesToPrice.length) * 100, 99));
    }

    // 计算总资产
    let recordsSynced = 0;
    for (const [currency, amount] of Object.entries(totalBalances)) {
      if (amount <= 0) continue;
      recordsSynced++;
      if (nonStablecoins.includes(currency)) {
        totalUsd += (priceMap.get(currency) || 0) * amount;
      } else {
        totalUsd += amount;
      }
    }

    totalUsd = Math.round(totalUsd * 100) / 100;

    // 写入 asset_snapshots
    const db = getDb();
    const today = getTodayStr();

    db.prepare(`
      INSERT INTO asset_snapshots (api_id, date, total_asset_usd, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(api_id, date) DO UPDATE SET
        total_asset_usd = excluded.total_asset_usd,
        created_at = excluded.created_at
    `).run(apiId, today, totalUsd, Date.now());

    setSyncState(apiId, 2, 100); // 同步完成

    // 更新同步日志为成功
    updateSyncLog(logId, {
      status: 'success',
      finished_at: Date.now(),
      records_synced: recordsSynced,
    });

    console.log(`[DataSync] API ${apiId} synced: total USD = ${totalUsd}`);
  } catch (err: any) {
    setSyncState(apiId, 3, 0); // 同步失败

    // 更新同步日志为失败
    updateSyncLog(logId, {
      status: 'failed',
      finished_at: Date.now(),
      error_message: err.message,
    });

    throw err;
  }
}

/**
 * 同步所有 API 的数据
 */
export async function syncAllApis(): Promise<{ success: number; failed: number }> {
  const apis = getAllApis();
  let success = 0;
  let failed = 0;

  for (const api of apis) {
    try {
      await syncApiData(api.id);
      success++;
    } catch (err: any) {
      console.error(`[DataSync] Failed to sync API ${api.id}:`, err.message);
      failed++;
    }
  }

  console.log(`[DataSync] All APIs synced: ${success} success, ${failed} failed`);
  return { success, failed };
}

// ============ 历史委托方法 ============

/**
 * 获取历史委托（已成交）
 * 通过 ccxt fetchMyTrades 获取历史成交记录
 */
export async function getHistoryOrders(
  apiId: number,
  params?: { symbol?: string; limit?: number; since?: number; until?: number }
): Promise<HistoryOrder[]> {
  const api = getDecryptedApi(apiId);
  if (!api) throw new Error('API not found');

  const exchange = createExchange(api);
  if (!exchange) throw new Error('Exchange not supported');

  try {
    // ccxt 统一接口 fetchMyTrades 获取历史成交
    const trades = await safeCall(
      () => exchange.fetchMyTrades({
        symbol: params?.symbol,
        limit: params?.limit || 50,
        since: params?.since,
        until: params?.until,
      }),
      [] as any[]
    );

    return trades.map((trade: any) => ({
      id: String(trade.id || ''),
      symbol: trade.symbol || '',
      side: trade.side || 'buy',       // buy/sell
      price: trade.price || 0,
      amount: trade.amount || 0,
      cost: trade.cost || 0,
      fee: trade.fee?.cost || 0,
      feeCurrency: trade.fee?.currency || '',
      orderId: String(trade.order || ''),
      timestamp: trade.timestamp || Date.now(),
      datetime: trade.datetime || new Date().toISOString(),
    }));
  } finally {
    exchange.close();
  }
}
