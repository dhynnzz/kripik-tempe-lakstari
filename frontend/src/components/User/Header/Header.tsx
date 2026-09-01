import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

interface HeaderProps {
  onSwitchToAdmin?: () => void;
  onNavigate?: (view: 'home' | 'about' | 'track-order') => void;
  currentView?: 'home' | 'about' | 'track-order';
}

const Header: React.FC<HeaderProps> = ({ onSwitchToAdmin, onNavigate, currentView = 'home' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener untuk Sticky Header Transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Inisialisasi awal
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (view: 'home' | 'about' | 'track-order') => {
    setMobileMenuOpen(false);
    onNavigate?.(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-content">
        {/* Logo Toko */}
        <div
          className="logo"
          onClick={() => handleNavClick('home')}
          style={{ cursor: 'pointer' }}
        >
          Kripik Tempe Lakstari
        </div>

        {/* Desktop Navigation */}
        <nav className="nav nav-desktop">
          <a
            href="#"
            className={currentView === 'home' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
          >
            Beranda
          </a>
          <a
            href="#"
            className={currentView === 'track-order' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); handleNavClick('track-order'); }}
          >
            Cek Pesanan
          </a>
          <a
            href="#"
            className={currentView === 'about' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}
          >
            Tentang Kami
          </a>
          {onSwitchToAdmin && (
            <button className="admin-nav-btn" onClick={onSwitchToAdmin}>
              🔐 Portal Admin
            </button>
          )}
        </nav>

        {/* Header Actions Right */}
        <div className="header-actions">
          <a
            href="https://wa.me/6282340074645"
            target="_blank"
            rel="noopener noreferrer"
            className="wa-btn-link"
            title="Chat WhatsApp Kami"
          >
            <img src="/images/icons/wa.png" alt="WhatsApp Hubungi Kami" className="wa-icon" />
          </a>

          {/* Mobile Circular Hamburger / X Toggle Button */}
          <button
            type="button"
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu Navigasi"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Dropdown Menu dengan Fluid Framer-Motion Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-dropdown-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.25 }
              }
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.2 }
              }
            }}
          >
            <div className="mobile-dropdown-inner">
              {/* List Menu Links */}
              <div className="mobile-menu-list">
                <a
                  href="#"
                  className={`mobile-list-item ${currentView === 'home' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
                >
                  Beranda
                </a>

                <a
                  href="#"
                  className={`mobile-list-item ${currentView === 'track-order' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavClick('track-order'); }}
                >
                  Cek Pesanan
                </a>

                <a
                  href="#"
                  className={`mobile-list-item ${currentView === 'about' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}
                >
                  Tentang Kami
                </a>

                <a
                  href="https://wa.me/6282340074645"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-list-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hubungi WhatsApp
                </a>
              </div>

              {/* Bottom Orange/Gold CTA Button */}
              {onSwitchToAdmin && (
                <button
                  type="button"
                  className="mobile-cta-btn"
                  onClick={() => { setMobileMenuOpen(false); onSwitchToAdmin(); }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Portal Admin</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
