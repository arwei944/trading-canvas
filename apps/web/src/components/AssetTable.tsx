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
import type { AssetBalance } from '@trading.canvas/core';
import { useTranslation } from 'react-i18next';

interface AssetTableProps {
  assets: AssetBalance[];
}

export function AssetTable({ assets }: AssetTableProps) {
  const { t } = useTranslation();

  if (!assets || assets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">{t('dashboard.noData')}</Typography>
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
            <TableCell>{t('assets.coin')}</TableCell>
            <TableCell align="right">{t('assets.price')}</TableCell>
            <TableCell align="right">{t('assets.allocation')}</TableCell>
            <TableCell align="right">{t('assets.quantity')}</TableCell>
            <TableCell align="right">{t('assets.value')}</TableCell>
            <TableCell align="right">{t('dashboard.change24h')}</TableCell>
            <TableCell align="right">{t('assets.pnl7d')}</TableCell>
            <TableCell align="right">{t('assets.pnl30d')}</TableCell>
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
