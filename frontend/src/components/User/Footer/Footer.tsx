import React from 'react';
import './Footer.css';

interface FooterProps {
  onNavigate?: (view: 'home' | 'about' | 'track-order') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (e: React.MouseEvent, view: 'home' | 'about' | 'track-order', targetId?: string) => {
    e.preventDefault();
    onNavigate?.(view);
    if (view === 'home' && targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="footer-wave">
      <footer className="footer">
        <div className="container footer-content">

          {/* Kolom 1: Navigasi */}
          <div className="footer-col">
            <h4>NAVIGASI</h4>
            <ul>
              <li><a href="#" onClick={(e) => handleNav(e, 'about')}>&gt; Tentang Kami</a></li>
              <li><a href="#" onClick={(e) => handleNav(e, 'track-order')}>&gt; Cek Pesanan</a></li>
            </ul>
          </div>

          {/* Kolom 2: Informasi Lebih Lanjut */}
          <div className="footer-col border-col">
            <h4>INFORMASI LEBIH LANJUT</h4>
            <ul className="info-list">
              <li>
                <span className="icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                </span>
                +62 823-4007-4645
              </li>
              <li>
                <span className="icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                info@lakstari.com
              </li>
            </ul>
          </div>

          {/* Kolom 3: Ikuti Kami */}
          <div className="footer-col border-col">
            <h4>IKUTI KAMI</h4>
            <div className="social-action-icons">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-action-btn" title="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 48 48">
                  <radialGradient id="instagram-rg1" cx="19.38" cy="42.035" r="44.899" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#fd5" />
                    <stop offset=".328" stopColor="#ff543e" />
                    <stop offset=".348" stopColor="#ff5245" />
                    <stop offset=".504" stopColor="#e64771" />
                    <stop offset=".643" stopColor="#d13e96" />
                    <stop offset=".761" stopColor="#c538a8" />
                    <stop offset=".79" stopColor="#c236ad" />
                    <stop offset=".904" stopColor="#9c27b0" />
                    <stop offset="1" stopColor="#673ab7" />
                  </radialGradient>
                  <path fill="url(#instagram-rg1)" d="M34.017 41.99l-20-.019c-4.4 0-8-3.6-8-8v-20c0-4.4 3.6-8 8-8l20 .019c4.4 0 8 3.6 8 8v20c0 4.4-3.6 8-8 8z" />
                  <radialGradient id="instagram-rg2" cx="11.786" cy="5.54" r="29.813" gradientTransform="matrix(1 0 0 .1 -.017 26.612)" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#4168c9" />
                    <stop offset=".999" stopColor="#4168c9" stopOpacity="0" />
                  </radialGradient>
                  <path fill="url(#instagram-rg2)" d="M34.017 41.99l-20-.019c-4.4 0-8-3.6-8-8v-20c0-4.4 3.6-8 8-8l20 .019c4.4 0 8 3.6 8 8v20c0 4.4-3.6 8-8 8z" />
                  <path fill="#fff" d="M24 31c-3.859 0-7-3.14-7-7s3.141-7 7-7 7 3.14 7 7-3.141 7-7 7zm0-12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                  <circle cx="31.5" cy="16.5" r="1.5" fill="#fff" />
                  <path fill="#fff" d="M30 37H18c-3.859 0-7-3.14-7-7V18c0-3.86 3.141-7 7-7h12c3.859 0 7 3.14 7 7v12c0 3.86-3.141 7-7 7zM18 13c-2.757 0-5 2.243-5 5v12c0 2.757 2.243 5 5 5h12c2.757 0 5-2.243 5-5V18c0-2.757-2.243-5-5-5H18z" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-action-btn" title="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 48 48">
                  <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path>
                  <path fill="#fff" d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"></path>
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="social-action-btn" title="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 48 48">
                  <path fill="#212121" fillRule="evenodd" d="M10.904,6h26.191C39.804,6,42,8.196,42,10.904v26.191 C42,39.804,39.804,42,37.096,42H10.904C8.196,42,6,39.804,6,37.096V10.904C6,8.196,8.196,6,10.904,6z" clipRule="evenodd"></path>
                  <path fill="#ec407a" fillRule="evenodd" d="M29.208,20.607c1.576,1.126,3.507,1.788,5.592,1.788v-4.011 c-0.395,0-0.788-0.041-1.174-0.123v3.157c-2.085,0-4.015-0.663-5.592-1.788v8.184c0,4.094-3.321,7.413-7.417,7.413 c-1.528,0-2.949-0.462-4.129-1.254c1.347,1.376,3.225,2.23,5.303,2.23c4.096,0,7.417-3.319,7.417-7.413L29.208,20.607L29.208,20.607 z M30.657,16.561c-0.805-0.879-1.334-2.016-1.449-3.273v-0.516h-1.113C28.375,14.369,29.331,15.734,30.657,16.561L30.657,16.561z M19.079,30.832c-0.45-0.59-0.693-1.311-0.692-2.053c0-1.873,1.519-3.391,3.393-3.391c0.349,0,0.696,0.053,1.029,0.159v-4.1 c-0.389-0.053-0.781-0.076-1.174-0.068v3.191c-0.333-0.106-0.68-0.159-1.03-0.159c-1.874,0-3.393,1.518-3.393,3.391 C17.213,29.127,17.972,30.274,19.079,30.832z" clipRule="evenodd"></path>
                  <path fill="#fff" fillRule="evenodd" d="M28.034,19.63c1.576,1.126,3.507,1.788,5.592,1.788v-3.157 c-1.164-0.248-2.194-0.856-2.969-1.701c-1.326-0.827-2.281-2.191-2.561-3.788h-2.923v16.018c-0.007,1.867-1.523,3.379-3.393,3.379 c-1.102,0-2.081-0.525-2.701-1.338c-1.107-0.558-1.866-1.705-1.866-3.029c0-1.873,1.519-3.391,3.393-3.391 c0.359,0,0.705,0.056,1.03,0.159V21.38c-4.024,0.083-7.26,3.369-7.26,7.411c0,2.018,0.806,3.847,2.114,5.183 c1.18,0.792,2.601,1.254,4.129,1.254c4.096,0,7.417-3.319,7.417-7.413L28.034,19.63L28.034,19.63z" clipRule="evenodd"></path>
                  <path fill="#81d4fa" fillRule="evenodd" d="M33.626,18.262v-0.854c-1.05,0.002-2.078-0.292-2.969-0.848 C31.445,17.423,32.483,18.018,33.626,18.262z M28.095,12.772c-0.027-0.153-0.047-0.306-0.061-0.461v-0.516h-4.036v16.019 c-0.006,1.867-1.523,3.379-3.393,3.379c-0.549,0-1.067-0.13-1.526-0.362c0.62,0.813,1.599,1.338,2.701,1.338 c1.87,0,3.386-1.512,3.393-3.379V12.772H28.095z M21.635,21.38v-0.909c-0.337-0.046-0.677-0.069-1.018-0.069 c-4.097,0-7.417,3.319-7.417,7.413c0,2.567,1.305,4.829,3.288,6.159c-1.308-1.336-2.114-3.165-2.114-5.183 C14.374,24.749,17.611,21.463,21.635,21.38z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Distinct Bottom Copyright Strip */}
      <div className="footer-copyright-strip">
        <div className="container copyright-content">
          <p className="copyright-text">
            &copy; 2026 Kripik Tempe Lakstari. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
