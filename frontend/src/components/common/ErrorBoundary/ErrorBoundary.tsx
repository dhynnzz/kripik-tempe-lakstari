import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-screen">
          <div className="error-boundary-backdrop-glow" />
          
          <div className="error-boundary-card">
            {/* Illustration / Icon */}
            <div className="error-icon-wrapper">
              <div className="error-icon-pulse" />
              <div className="error-icon-badge">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>

            {/* Error Code & Title */}
            <span className="error-status-tag">Sistem Terkendala (500)</span>
            <h1 className="error-title">Oops! Terjadi Gangguan Teknis</h1>
            <p className="error-description">
              Halaman ini mengalami kendala sesaat saat memuat data. Jangan khawatir, data pesanan dan keranjang belanja Anda tetap aman.
            </p>

            {/* Action Buttons */}
            <div className="error-actions">
              <button onClick={this.handleReload} className="btn-error-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>Muat Ulang Halaman</span>
              </button>

              <button onClick={this.handleGoHome} className="btn-error-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Kembali ke Beranda</span>
              </button>
            </div>

            {/* Help Link */}
            <div className="error-help-footer">
              <span>Butuh bantuan segera? </span>
              <a
                href="https://wa.me/6288989600109?text=Halo%20Admin%20Kripik%20Tempe%20Lakstari,%20saya%20mengalami%20kendala%20di%20website"
                target="_blank"
                rel="noreferrer"
                className="error-wa-link"
              >
                Hubungi Admin via WhatsApp
              </a>
            </div>

            {/* Technical Detail Toggle for Developers/Admins */}
            {this.state.error && (
              <div className="error-technical-wrapper">
                <button onClick={this.toggleDetails} className="btn-toggle-technical">
                  <span>{this.state.showDetails ? 'Sembunyikan Rincian Teknis' : 'Tampilkan Rincian Teknis (Developer)'}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: this.state.showDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {this.state.showDetails && (
                  <div className="error-code-block">
                    <p className="error-msg"><strong>Pesan:</strong> {this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="error-stack">{this.state.errorInfo.componentStack}</pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
