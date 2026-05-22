import { Skeleton, Box, Card, CardContent, Grid } from '@mui/material';

// 卡片骨架
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
        ))}
      </CardContent>
    </Card>
  );
}

// 表格骨架
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <Box>
      {/* 表头 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1, px: 2 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / cols}%`} height={20} />
        ))}
      </Box>
      {/* 行 */}
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, py: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} variant="text" width={`${100 / cols}%`} height={20} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

// 图表骨架
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={height} />
      </CardContent>
    </Card>
  );
}

// Dashboard 总览骨架
export function DashboardSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} sm={4} key={i}>
              <CardSkeleton lines={1} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <ChartSkeleton height={300} />
      </Grid>
      <Grid item xs={12} md={6}>
        <ChartSkeleton height={300} />
      </Grid>
      <Grid item xs={12}>
        <TableSkeleton rows={5} cols={5} />
      </Grid>
    </Grid>
  );
}

// 列表骨架（用于 API 管理页面等）
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <Box>
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} sx={{ mb: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="30%" height={20} />
              <Skeleton variant="text" width="50%" height={16} />
            </Box>
            <Skeleton variant="rounded" width={80} height={32} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
