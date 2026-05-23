import React from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { OrderData } from '@trading.canvas/core';
import { useTranslation } from 'react-i18next';

export interface OrderTableProps {
  orders: OrderData[];
  loading?: boolean;
}

/**
 * 委托订单表格组件
 * 显示所有历史委托订单
 */
export function OrderTable({ orders, loading }: OrderTableProps) {
  const { t } = useTranslation();

  // 订单状态映射
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: t('orders.pending'), color: 'warning' as const };
      case 1:
        return { label: t('orders.partial'), color: 'info' as const };
      case 2:
        return { label: t('orders.filledStatus'), color: 'success' as const };
      case 3:
        return { label: t('orders.cancelled'), color: 'default' as const };
      case 4:
        return { label: t('orders.invalid'), color: 'error' as const };
      default:
        return { label: t('orders.invalid'), color: 'default' as const };
    }
  };

  // 订单方向
  const getSideText = (side: string) => {
    return side === 'BUY' ? t('orders.buy') : t('orders.sell');
  };

  const getSideColor = (side: string) => {
    return side === 'BUY' ? 'success' : 'error';
  };

  // 订单类型
  const getOrderTypeText = (type: string) => {
    switch (type) {
      case 'LIMIT':
        return t('orders.limit');
      case 'MARKET':
        return t('orders.market');
      case 'STOP':
        return t('orders.stop');
      case 'STOP_MARKET':
        return t('orders.stopMarket');
      case 'TAKE_PROFIT':
        return t('orders.takeProfit');
      case 'TAKE_PROFIT_MARKET':
        return t('orders.takeProfitMarket');
      case 'TRAILING_STOP_MARKET':
        return type;
      default:
        return type || t('orders.limit');
    }
  };

  // 格式化时间戳
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>{t('common.loading')}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary" align="center">
            {t('dashboard.noOrders')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>{t('orders.time')}</TableCell>
                <TableCell>{t('orders.exchange')}</TableCell>
                <TableCell>{t('orders.symbol')}</TableCell>
                <TableCell align="center">{t('orders.side')}</TableCell>
                <TableCell>{t('orders.type')}</TableCell>
                <TableCell align="right">{t('orders.price')}</TableCell>
                <TableCell align="right">{t('orders.amount')}</TableCell>
                <TableCell align="right">{t('orders.filled')}</TableCell>
                <TableCell align="right">{t('orders.avgPrice')}</TableCell>
                <TableCell align="right">{t('orders.total')}</TableCell>
                <TableCell align="center">{t('orders.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <TableRow key={order.orderId} hover>
                    <TableCell>
                      <Typography variant="caption">
                        {formatTime(order.createTime || order.time)}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.exchangeName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {order.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getSideText(order.side)}
                        color={getSideColor(order.side)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getOrderTypeText(order.type)}</TableCell>
                    <TableCell align="right">
                      {order.price ? `$${Number(order.price).toFixed(2)}` : t('orders.market')}
                    </TableCell>
                    <TableCell align="right">
                      {Number(order.origQty || order.amount).toFixed(4)}
                    </TableCell>
                    <TableCell align="right">
                      {Number(order.executedQty || 0).toFixed(4)}
                    </TableCell>
                    <TableCell align="right">
                      {order.avgPrice ? `$${Number(order.avgPrice).toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      ${Number(order.cummulativeQuoteQty || order.dealCash || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
