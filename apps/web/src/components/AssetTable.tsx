// apps/web/src/components/AssetTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import type { AssetBalance } from '@trading-canvas/core';

interface AssetTableProps {
  assets: AssetBalance[];
}

export function AssetTable({ assets }: AssetTableProps) {
  if (assets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">暂无资产</Typography>
      </Box>
    );
  }

  const formatValue = (value: number, prefix = '$') => {
    if (Math.abs(value) >= 10000) {
      return `${prefix}${(value / 10000).toFixed(2)}万`;
    }
    return `${prefix}${value.toFixed(4)}`;
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>币种</TableCell>
            <TableCell align="right">价格</TableCell>
            <TableCell align="right">资产分配</TableCell>
            <TableCell align="right">数量</TableCell>
            <TableCell align="right">价值</TableCell>
            <TableCell align="right">24h盈亏</TableCell>
            <TableCell align="right">7天盈亏</TableCell>
            <TableCell align="right">30天盈亏</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.asset} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {asset.symbolLogo && (
                    <img
                      src={asset.symbolLogo}
                      alt={asset.asset}
                      width={24}
                      height={24}
                    />
                  )}
                  {asset.asset}
                </Box>
              </TableCell>
              <TableCell align="right">{formatValue(asset.price)}</TableCell>
              <TableCell align="right">
                <Chip
                  label={`${asset.radio.toFixed(2)}%`}
                  size="small"
                  sx={{ bgcolor: 'primary.dark', color: 'white' }}
                />
              </TableCell>
              <TableCell align="right">{parseFloat(asset.amount).toFixed(6)}</TableCell>
              <TableCell align="right">{formatValue(asset.usdValuation)}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (asset.assetUsdChange24H ?? 0) >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {formatValue(asset.assetUsdChange24H ?? 0)}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (asset.assetUsdChange7D ?? 0) >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {formatValue(asset.assetUsdChange7D ?? 0)}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (asset.assetUsdChange30D ?? 0) >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {formatValue(asset.assetUsdChange30D ?? 0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
