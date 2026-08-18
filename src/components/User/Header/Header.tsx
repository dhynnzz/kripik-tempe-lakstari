import './Header.css';

interface HeaderProps {
  onSwitchToAdmin?: () => void;
  onNavigate?: (view: 'home' | 'track-order') => void;
  currentView?: 'home' | 'track-order';
}

const Header: React.FC<HeaderProps> = ({ onSwitchToAdmin, onNavigate, currentView = 'home' }) => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo" onClick={() => onNavigate?.('home')} style={{ cursor: 'pointer' }}>Kripik Tempe Lakstari</div>
        <nav className="nav">
          <a href="#" className={currentView === 'home' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onNavigate?.('home'); }}>Beranda</a>
          <a href="#" className={currentView === 'track-order' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onNavigate?.('track-order'); }}>Cek Pesanan</a>
          <a href="#" onClick={(e) => { if (currentView !== 'home') { e.preventDefault(); onNavigate?.('home'); } }}>Produk</a>
          {onSwitchToAdmin && (
            <button className="admin-nav-btn" onClick={onSwitchToAdmin}>
              🔐 Portal Admin
            </button>
          )}
        </nav>
        <a href="https://wa.me/6282340074645" target="_blank" rel="noopener noreferrer" className="wa-btn-link">
          <img src="/wa.png" alt="WhatsApp Hubungi Kami" className="wa-icon" />
        </a>
      </div>
    </header>
  );
};

export default Header;
