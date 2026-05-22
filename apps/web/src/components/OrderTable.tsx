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

export interface OrderTableProps {
  orders: OrderData[];
  loading?: boolean;
}

/**
 * 委托订单表格组件
 * 显示所有历史委托订单
 */
export function OrderTable({ orders, loading }: OrderTableProps) {
  // 订单状态映射
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: '等待中', color: 'warning' as const };
      case 1:
        return { label: '部分成交', color: 'info' as const };
      case 2:
        return { label: '完全成交', color: 'success' as const };
      case 3:
        return { label: '已撤销', color: 'default' as const };
      case 4:
        return { label: '无效', color: 'error' as const };
      default:
        return { label: '未知', color: 'default' as const };
    }
  };

  // 订单方向
  const getSideText = (side: string) => {
    return side === 'BUY' ? '买入' : '卖出';
  };

  const getSideColor = (side: string) => {
    return side === 'BUY' ? 'success' : 'error';
  };

  // 订单类型
  const getOrderTypeText = (type: string) => {
    switch (type) {
      case 'LIMIT':
        return '限价';
      case 'MARKET':
        return '市价';
      case 'STOP':
        return '止损';
      case 'STOP_MARKET':
        return '止损市价';
      case 'TAKE_PROFIT':
        return '止盈';
      case 'TAKE_PROFIT_MARKET':
        return '止盈市价';
      case 'TRAILING_STOP_MARKET':
        return '追踪止损';
      default:
        return type || '限价';
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
          <Typography>加载中...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary" align="center">
            暂无委托记录
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
                <TableCell>时间</TableCell>
                <TableCell>交易所</TableCell>
                <TableCell>交易对</TableCell>
                <TableCell align="center">方向</TableCell>
                <TableCell>类型</TableCell>
                <TableCell align="right">委托价格</TableCell>
                <TableCell align="right">委托数量</TableCell>
                <TableCell align="right">成交数量</TableCell>
                <TableCell align="right">成交均价</TableCell>
                <TableCell align="right">成交金额</TableCell>
                <TableCell align="center">状态</TableCell>
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
                      {order.price ? `$${Number(order.price).toFixed(2)}` : '市价'}
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
