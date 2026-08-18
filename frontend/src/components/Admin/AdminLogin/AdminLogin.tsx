import { useState } from 'react';
import { apiService } from '../../../services/api';
import './AdminLogin.css';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

// Standard SVG Icons for Email, Lock, Eye, and EyeOff
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@lakstari.com');
  const [password, setPassword] = useState('adminlakstari2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await apiService.loginAdmin(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.message || 'Email atau Password Admin yang Anda masukkan salah.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan koneksi ke server backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="bg-ambient-gradient" />

      <div className="login-card-container">
        <div className="simple-card">
          {/* Header */}
          <div className="login-header">
            <h1>Portal Admin Lakstari</h1>
            <p>Masuk untuk mengelola stok, varian rasa, dan pesanan toko.</p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="login-error-alert">
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group-login">
              <label>Email Admin</label>
              <div className="input-wrapper-login">
                <span className="input-icon-left">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  className="login-input"
                  placeholder="admin@lakstari.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group-login">
              <label>Kata Sandi Admin</label>
              <div className="input-wrapper-login">
                <span className="input-icon-left">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="login-options-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Ingat Sesi Saya
              </label>
            </div>

            {/* Submit Button Lakstari Gold */}
            <button
              type="submit"
              className="btn-login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Masuk Portal Admin</span>
                  <span style={{ fontSize: '16px' }}>&rarr;</span>
                </>
              )}
            </button>
          </form>

          {/* Hint Default Credentials */}
          <div className="login-credentials-hint">
            🔑 <strong>Kredensial Default Admin:</strong><br />
            Email: <code>admin@lakstari.com</code> | Password: <code>adminlakstari2026</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
