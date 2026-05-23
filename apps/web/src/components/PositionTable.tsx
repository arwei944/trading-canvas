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
import { useTranslation } from 'react-i18next';

export interface PositionTableProps {
  positions: PositionData[];
  loading?: boolean;
}

/**
 * 合约持仓表格组件
 * 显示所有合约的持仓数据
 */
export function PositionTable({ positions, loading }: PositionTableProps) {
  const { t } = useTranslation();

  // 计算颜色
  const getSideColor = (side: string) => {
    return side === 'LONG' ? 'error' : 'success';
  };

  const getSideText = (side: string) => {
    return side === 'LONG' ? t('positions.long') : t('positions.short');
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

  if (!positions || positions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary" align="center">
            {t('dashboard.noPositions')}
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
                <TableCell>{t('positions.exchange')}</TableCell>
                <TableCell>{t('positions.symbol')}</TableCell>
                <TableCell align="center">{t('positions.side')}</TableCell>
                <TableCell align="right">{t('positions.amount')}</TableCell>
                <TableCell align="right">{t('positions.entryPrice')}</TableCell>
                <TableCell align="right">{t('positions.markPrice')}</TableCell>
                <TableCell align="right">{t('positions.liquidationPrice')}</TableCell>
                <TableCell align="right">{t('positions.pnl')}</TableCell>
                <TableCell align="right">{t('positions.pnlRate')}</TableCell>
                <TableCell align="right">{t('positions.margin')}</TableCell>
                <TableCell align="right">{t('positions.leverage')}</TableCell>
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
