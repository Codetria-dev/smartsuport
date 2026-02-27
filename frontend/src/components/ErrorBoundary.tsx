import { Component, ErrorInfo, ReactNode } from 'react';
import i18n from '../i18n';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full content-card text-center">
            <div className="flex justify-center mb-4">
              <div className="text-red-600 text-5xl font-bold">!</div>
            </div>
            <h1 className="page-title mb-2">{i18n.t('common:somethingWentWrong')}</h1>
            <p className="text-gray-600 mb-6">
              {i18n.t('common:unexpectedError')}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-left">
                <p className="text-sm font-mono text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="primary">
                {i18n.t('common:backToHome')}
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
              >
                {i18n.t('common:reloadPage')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
