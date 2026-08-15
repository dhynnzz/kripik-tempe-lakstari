import './Header.css';

interface HeaderProps {
  onSwitchToAdmin?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSwitchToAdmin }) => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">Kripik Tempe Lakstari</div>
        <nav className="nav">
          <a href="#">Beranda</a>
          <a href="#">Tentang Kami</a>
          <a href="#">Produk</a>
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
