import React, { useState } from 'react';
import './HttpError.css';

export type HttpErrorCode = 400 | 401 | 403 | 404 | 500 | 502 | 503 | 504;

export interface HttpErrorProps {
  code: HttpErrorCode;
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetailsToggle?: boolean;
}

interface ErrorMeta {
  type: 'Client Error' | 'Server Error';
  title: string;
  description: string;
  icon: React.ReactNode;
  primaryActionText: string;
}

const ERROR_METAS: Record<HttpErrorCode, ErrorMeta> = {
  // ─── CLIENT ERRORS (4xx) ──────────────────────────────
  400: {
    type: 'Client Error',
    title: 'Permintaan Tidak Valid (Bad Request)',
    description: 'Format data, formulir, atau parameter yang dikirimkan oleh browser tidak sesuai dan tidak dapat diproses oleh sistem.',
    primaryActionText: 'Kembali & Periksa Data',
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <line x1="9" y1="11" x2="11" y2="11" />
      </svg>
    ),
  },
  401: {
    type: 'Client Error',
    title: 'Akses Ditolak (Unauthorized)',
    description: 'Anda belum terautentikasi atau sesi login Anda telah berakhir. Silakan login kembali untuk melanjutkan.',
    primaryActionText: 'Masuk / Login Akun',
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  403: {
    type: 'Client Error',
    title: 'Akses Dilarang (Forbidden)',
    description: 'Anda tidak memiliki hak akses yang cukup untuk membuka halaman atau data ini. Area ini khusus dibatasi.',
    primaryActionText: 'Kembali ke Beranda',
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
  },
  404: {
    type: 'Client Error',
    title: 'Halaman Tidak Ditemukan (Not Found)',
    description: 'Halaman, produk, atau tautan yang Anda cari tidak tersedia, sudah dihapus, atau alamat URL salah.',
    primaryActionText: 'Kembali ke Beranda',
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },

  // ─── SERVER ERRORS (5xx) ──────────────────────────────
  500: {
    type: 'Server Error',
    title: 'Gangguan Server Internal (Internal Server Error)',
    description: 'Terjadi kendala tidak terduga pada sistem saat memproses data Anda. Data belanja dan pesanan Anda tetap aman.',
    primaryActionText: 'Muat Ulang Halaman',
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
        <line x1="10" y1="14" x2="14" y2="18" />
        <line x1="14" y1="14" x2="10" y2="18" />
      </svg>
    ),
  },
  502: {
    type: 'Server Error',
    title: 'Gerbang Server Tidak Valid (Bad Gateway)',
    description: 'Server utama menerima respons yang tidak valid dari server penghubung (gateway/upstream). Silakan coba beberapa saat lagi.',
    primaryActionText: 'Coba Hubungkan Kembali',
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
  },
  503: {
    type: 'Server Error',
    title: 'Layanan Dalam Pemeliharaan (Service Unavailable)',
    description: 'Sistem Lakstari saat ini sedang dalam proses pemeliharaan rutin atau server sedang menerima lonjakan lalu lintas yang tinggi.',
    primaryActionText: 'Cek Kembali Nanti',
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  504: {
    type: 'Server Error',
    title: 'Waktu Gateway Habis (Gateway Timeout)',
    description: 'Server membutuhkan waktu terlalu lama untuk memproses permintaan atau tidak menerima respons tepat waktu dari jaringan upstream.',
    primaryActionText: 'Muat Ulang Halaman',
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
};

export const HttpError: React.FC<HttpErrorProps> = ({
  code,
  title,
  message,
  details,
  onRetry,
  onGoHome,
  showDetailsToggle = true,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const meta = ERROR_METAS[code] || ERROR_METAS[500];

  const handlePrimaryAction = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    if (code === 401) {
      window.location.href = '/admin/login';
      return;
    }
    if (code === 404 || code === 403) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
      return;
    }
    window.location.reload();
  };

  const handleSecondaryAction = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const isClientError = code >= 400 && code < 500;

  return (
    <div className={`http-error-screen http-error-${code}`}>
      <div className="http-error-backdrop-glow" />

      <div className="http-error-card">
        {/* Badge & Code */}
        <div className="http-error-header-badge">
          <span className={`http-error-tag ${isClientError ? 'tag-client' : 'tag-server'}`}>
            {meta.type} • {code}
          </span>
        </div>

        {/* Visual Icon Badge */}
        <div className="http-error-icon-wrapper">
          <div className="http-error-icon-pulse" />
          <div className={`http-error-icon-badge ${isClientError ? 'icon-client' : 'icon-server'}`}>
            {meta.icon}
          </div>
        </div>

        {/* Big Code Watermark */}
        <div className="http-error-code-watermark">{code}</div>

        {/* Title & Description */}
        <h1 className="http-error-title">{title || meta.title}</h1>
        <p className="http-error-description">{message || meta.description}</p>

        {/* Action Buttons */}
        <div className="http-error-actions">
          <button type="button" onClick={handlePrimaryAction} className="btn-http-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {code === 401 ? (
                <>
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </>
              ) : code === 404 || code === 403 ? (
                <>
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </>
              ) : (
                <>
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </>
              )}
            </svg>
            <span>{meta.primaryActionText}</span>
          </button>

          <button type="button" onClick={handleSecondaryAction} className="btn-http-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        {/* Technical Details Accordion (Optional) */}
        {details && showDetailsToggle && (
          <div className="http-error-details-wrap">
            <button
              type="button"
              className="btn-toggle-http-details"
              onClick={() => setShowTechnicalDetails((prev) => !prev)}
            >
              <span>{showTechnicalDetails ? 'Sembunyikan Informasi Teknis' : 'Lihat Informasi Teknis (Developer)'}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ transform: showTechnicalDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showTechnicalDetails && (
              <div className="http-error-details-box">
                <pre>{details}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── HELPER SHORTCUT COMPONENTS ─────────────────────────────
export const Error400: React.FC<Omit<HttpErrorProps, 'code'>> = (props) => <HttpError code={400} {...props} />;
export const Error401: React.FC<Omit<HttpErrorProps, 'code'>> = (props) => <HttpError code={401} {...props} />;
export const Error403: React.FC<Omit<HttpErrorProps, 'code'>> = (props) => <HttpError code={403} {...props} />;
export const Error404: React.FC<Omit<HttpErrorProps, 'code'>> = (props) => <HttpError code={404} {...props} />;
export const Error500: React.FC<Omit<HttpErrorProps, 'code'>> = (props) => <HttpError code={500} {...props} />;
export const Error502: React.FC<Omit<HttpErrorProps, 'code'>> = (props) => <HttpError code={502} {...props} />;
export const Error503: React.FC<Omit<HttpErrorProps, 'code'>> = (props) => <HttpError code={503} {...props} />;
export const Error504: React.FC<Omit<HttpErrorProps, 'code'>> = (props) => <HttpError code={504} {...props} />;

export default HttpError;
