import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <AlertTriangle size={48} color="var(--warning)" />
            </div>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              {this.props.errorMessage || 'An unexpected error occurred. Please try again.'}
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <p style={styles.errorDetail}>
                {this.state.error.message}
              </p>
            )}
            <div style={styles.actions}>
              <Button variant="lime" onClick={this.handleReload} icon={<RefreshCw size={16} />}>
                Reload Page
              </Button>
              <Button variant="secondary" onClick={this.handleGoHome} icon={<Home size={16} />}>
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 64px)',
    padding: '40px 20px',
  },
  card: {
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
    padding: '48px 32px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-green)',
  },
  iconContainer: {
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-white)',
    marginBottom: '8px',
  },
  message: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '8px',
  },
  errorDetail: {
    fontSize: '12px',
    color: 'var(--error)',
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '24px',
    wordBreak: 'break-word',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '24px',
  },
};
