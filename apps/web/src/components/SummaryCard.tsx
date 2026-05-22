// apps/web/src/components/SummaryCard.tsx

import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface SummaryCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color?: 'primary' | 'success' | 'error' | 'default';
  highlight?: boolean;
}

export function SummaryCard({
  label,
  value,
  prefix = '',
  suffix,
  color = 'default',
  highlight = false,
}: SummaryCardProps) {
  const isPositive = value >= 0;
  const displayValue = Math.abs(value);

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 10000).toFixed(2)}万`;
    if (val >= 10000) return `${(val / 10000).toFixed(2)}万`;
    return val.toFixed(2);
  };

  const getColor = () => {
    if (color === 'success') return 'success.main';
    if (color === 'error') return 'error.main';
    if (color === 'primary') return 'primary.main';
    return 'text.primary';
  };

  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: highlight ? 'primary.dark' : 'background.paper',
      }}
    >
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          {color !== 'default' && (
            isPositive ? (
              <TrendingUp sx={{ color: getColor(), fontSize: 20 }} />
            ) : (
              <TrendingDown sx={{ color: getColor(), fontSize: 20 }} />
            )
          )}
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 600,
              color: highlight ? 'white' : getColor(),
            }}
          >
            {prefix}{formatValue(displayValue)}
          </Typography>
        </Box>
        {suffix && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {suffix}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
