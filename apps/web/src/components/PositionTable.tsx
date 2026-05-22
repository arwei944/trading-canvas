import React from 'react';
import {
  Box,
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
} from '@mui/material';
import { PositionData } from '@trading.canvas/core';

export interface PositionTableProps {
  positions: PositionData[];
  loading?: boolean;
}

/**
 * 合约持仓表格组件
 * 显示所有合约的持仓数据
 */
export function PositionTable({ positions, loading }: PositionTableProps) {
  // 计算颜色
  const getSideColor = (side: string) => {
    return side === 'LONG' ? 'error' : 'success';
  };

  const getSideText = (side: string) => {
    return side === 'LONG' ? '多' : '空';
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

  if (!positions || positions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary" align="center">
            暂无持仓数据
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
                <TableCell>交易所</TableCell>
                <TableCell>交易对</TableCell>
                <TableCell align="center">方向</TableCell>
                <TableCell align="right">持仓数量</TableCell>
                <TableCell align="right">开仓价格</TableCell>
                <TableCell align="right">标记价格</TableCell>
                <TableCell align="right">强平价格</TableCell>
                <TableCell align="right">盈亏(USDT)</TableCell>
                <TableCell align="right">盈亏率</TableCell>
                <TableCell align="right">保证金</TableCell>
                <TableCell align="right">杠杆</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.positionId} hover>
                  <TableCell>{position.exchangeName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {position.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getSideText(position.side)}
                      color={getSideColor(position.side)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {Number(position.amount).toFixed(4)}
                  </TableCell>
                  <TableCell align="right">
                    ${Number(position.avgPrice).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${Number(position.markPrice).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${Number(position.liquidationPrice).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={position.unrealizedPnl >= 0 ? 'success.main' : 'error.main'}
                    >
                      {position.unrealizedPnl >= 0 ? '+' : ''}
                      ${Number(position.unrealizedPnl).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={position.roi >= 0 ? 'success.main' : 'error.main'}
                    >
                      {position.roi >= 0 ? '+' : ''}
                      {(position.roi * 100).toFixed(2)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    ${Number(position.isolatedMargin || position.margin || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {position.leverage || 1}x
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
