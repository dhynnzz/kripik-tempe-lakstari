import './Footer.css';

const Footer = () => {
  return (
    <div className="footer-wave">
    <footer className="footer">
      <div className="container footer-content">
        
        <div className="footer-col">
          <h4>NAVIGASI</h4>
          <ul>
            <li><a href="#">&gt; Tentang Kami</a></li>
            <li><a href="#">&gt; Produk</a></li>
          </ul>
        </div>

        <div className="footer-col border-col">
          <h4>INFORMASI LEBIH LANJUT</h4>
          <ul className="info-list">
            <li>
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </span>
              Perum Griya Permata Mulia
            </li>
            <li>
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </span>
              +62 812-3456-7890
            </li>
            <li>
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
              info@lakstari.com
            </li>
            <li>
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
              <span>Senin - Sabtu<br/>08.00 - 17.00 WIB</span>
            </li>
          </ul>
        </div>

        <div className="footer-col border-col">
          <h4>IKUTI KAMI</h4>
          <ul className="social-list">
            <li>
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </span>
              @lakstari.id
            </li>
            <li>
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </span>
              Lakstari CS
            </li>
            <li>
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              </span>
              Kripik Tempe Lakstari
            </li>
          </ul>
        </div>
        
      </div>
      <div className="container">
        <div className="footer-bottom">
          <p>&copy; 2026 Kripik Tempe Lakstari. Seluruh Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default Footer;
