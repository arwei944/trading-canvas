import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import i18n from '../locales';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
          <Typography variant="h6" color="error">{i18n.t('common.errorTitle')}</Typography>
          <Typography color="text.secondary">{this.state.error?.message}</Typography>
          <Button variant="contained" onClick={() => this.setState({ hasError: false, error: null })}>
            {i18n.t('common.retry')}
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
