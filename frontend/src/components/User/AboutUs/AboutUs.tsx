import React, { useState, useEffect } from 'react';
import './AboutUs.css';

interface AboutUsProps {
  onBack?: () => void;
  onNavigateToCatalog?: () => void;
}

const momentsSlides = [
  {
    id: 1,
    img: '/images/products/paket-5-lengkap.png',
    alt: 'Paket Hampers Kripik Tempe Lakstari',
  },
  {
    id: 2,
    img: '/images/hero/product-tempeh-pouch.png',
    alt: 'Kemasan Pouch Kripik Tempe Sagu',
  },
  {
    id: 3,
    img: '/images/hero/hero-tempeh.png',
    alt: 'Dapur Produksi Tradisional Lakstari',
  },
  {
    id: 4,
    img: '/images/products/paket-4-hemat.png',
    alt: 'Paket Hemat Camilan Keluarga',
  },
  {
    id: 5,
    img: '/images/hero/product-tempeh-bowl.png',
    alt: 'Sajian Gurih Renyah Kripik Tempe',
  },
  {
    id: 6,
    img: '/images/products/flavor-original.png',
    alt: 'Varian Rasa Original Gurih Murni',
  },
  {
    id: 7,
    img: '/images/products/flavor-balado.png',
    alt: 'Varian Rasa Balado Spesial',
  },
  {
    id: 8,
    img: '/images/products/flavor-keju.png',
    alt: 'Varian Rasa Keju Gurih',
  },
];

const displaySlides = [
  ...momentsSlides,
  ...momentsSlides,
  ...momentsSlides,
  ...momentsSlides,
];

const AboutUs: React.FC<AboutUsProps> = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const totalDots = 4;

   useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next >= momentsSlides.length * 2 ? next % momentsSlides.length : next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [isDragging]);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return;

    // Jika telah melewati 1 siklus penuh, langsung snap tanpa animasi ke posisi ekuivalen
    if (currentIndex >= momentsSlides.length) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex % momentsSlides.length);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      const t = setTimeout(() => {
        setIsTransitioning(true);
      }, 40);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

 
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setIsTransitioning(false);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    setDragOffset(currentX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsTransitioning(true);
    if (dragOffset < -40) {
      // Geser ke kiri -> slide berikutnya (maju terus secara aman)
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next >= momentsSlides.length * 2 ? next % momentsSlides.length : next;
      });
    } else if (dragOffset > 40) {
      // Geser ke kanan -> slide sebelumnya secara aman
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : momentsSlides.length - 1));
    }
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsTransitioning(false);
    setStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    setDragOffset(currentX - startX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsTransitioning(true);
    if (dragOffset < -40) {
      // Geser ke kiri -> slide berikutnya (maju terus secara aman)
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next >= momentsSlides.length * 2 ? next % momentsSlides.length : next;
      });
    } else if (dragOffset > 40) {
      // Geser ke kanan -> slide sebelumnya secara aman
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : momentsSlides.length - 1));
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleDotClick = (idx: number) => {
    setIsTransitioning(true);
    setCurrentIndex(idx);
  };

  return (
    <div className="about-page">
      {/* 1. Full-Width Static Hero Banner dengan Judul & Kalimat Poppins */}
      <section className="about-hero-static">
        <img
          src="/images/hero/hero-tempeh.png"
          alt="Kripik Tempe Lakstari"
          className="about-hero-static-img"
        />

        {/* Soft Gradient Overlay for Text Contrast */}
        <div className="about-hero-static-overlay" />

        {/* Soft Misty Fog at the Bottom (Transisi Kabut Putih Halus) */}
        <div className="about-hero-fog-bottom" />

        <div className="container about-hero-static-container">
          <div className="about-hero-static-content">
            <h1 className="about-hero-montserrat-title">
              KRIPIK TEMPE LAKSTARI
            </h1>
            <p className="about-hero-poppins-subtitle">
              Renyah, Gurih, Nagih. Camilan tradisional kualitas&nbsp;premium yang diolah dengan resep rahasia&nbsp;keluarga.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Kenapa Pilih Kripik Tempe Lakstari Section (Above Cerita Dari Owner) */}
      <section id="why-choose-section" className="why-choose-section">
        <div className="container">
          <div className="why-choose-header">
            <h2 className="why-choose-title">
              <span className="title-dark">Kenapa Pilih</span>
              <span className="title-yellow">Kripik Tempe Lakstari?</span>
            </h2>
            <p className="why-choose-subtitle">
              Keunggulan yang membuat keripik kami selalu dirindukan.
            </p>
          </div>

          <div className="why-choose-grid">
            {/* Card 1: Bahan Alami */}
            <div className="why-card">
              <div className="why-card-icon mint">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <h3>Bahan Alami</h3>
              <p>Tempe segar, sagu aren murni, dan rempah pilihan tanpa bahan sintetis.</p>
            </div>

            {/* Card 2: Tanpa Pengawet */}
            <div className="why-card">
              <div className="why-card-icon purple">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 200"
                  width="34"
                  height="34"
                  fill="none"
                >
                  {/* Lingkaran tanda larangan */}
                  <circle cx="100" cy="100" r="70" stroke="#E52345" strokeWidth="8" />

                  {/* Erlenmeyer Flask */}
                  <path
                    d="M84 48 H116 V57 C116 60 114 62 110 62 V76 L128 137 C130 144 125 150 118 150 H82 C75 150 70 144 72 137 L90 76 V62 C86 62 84 60 84 57 V48Z"
                    fill="#FFFFFF"
                    stroke="#111111"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />

                  {/* Cairan */}
                  <path
                    d="M76 119 C87 115 99 124 109 121 C115 119 120 119 124 119 L130 139 C132 145 127 150 121 150 H79 C73 150 68 145 70 139 L76 119Z"
                    fill="#111111"
                  />

                  {/* Permukaan cairan */}
                  <path
                    d="M76 119 C87 115 99 124 109 121 C115 119 120 119 124 119"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Gelembung */}
                  <circle cx="92" cy="96" r="2.5" fill="#111111" />
                  <circle cx="111" cy="105" r="2" fill="#111111" />

                  {/* Highlight pada flask */}
                  <path d="M87 78L76 132" stroke="#777777" strokeWidth="3" strokeLinecap="round" />

                  {/* Garis larangan diagonal */}
                  <path d="M53 53L147 147" stroke="#E52345" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Tanpa Pengawet</h3>
              <p>Diproses sedemikian rupa hingga awet secara alami.</p>
            </div>

            {/* Card 3: Renyah Tahan Lama */}
            <div className="why-card">
              <div className="why-card-icon yellow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 200"
                  width="34"
                  height="34"
                  fill="none"
                >
                  {/* Lingkaran utama */}
                  <circle cx="100" cy="100" r="70" stroke="#E52345" strokeWidth="8" />

                  {/* Keripik / snack */}
                  <path
                    d="M65 91 C65 82 72 76 81 76 H119 C128 76 135 82 135 91 V124 C135 134 127 142 117 142 H83 C73 142 65 134 65 124 V91Z"
                    fill="#FFFFFF"
                    stroke="#111111"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />

                  {/* Tekstur keripik */}
                  <path d="M78 91L88 87" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
                  <path d="M104 88L119 93" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
                  <path d="M79 109L91 105" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
                  <path d="M105 110L122 115" stroke="#111111" strokeWidth="3" strokeLinecap="round" />

                  {/* Simbol waktu */}
                  <circle cx="125" cy="125" r="24" fill="#FFFFFF" stroke="#E52345" strokeWidth="5" />

                  {/* Jarum jam */}
                  <path d="M125 112V125L134 131" stroke="#111111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Sparkle */}
                  <path d="M69 61V72" stroke="#E52345" strokeWidth="4" strokeLinecap="round" />
                  <path d="M64 66.5H74" stroke="#E52345" strokeWidth="4" strokeLinecap="round" />
                  <path d="M145 67V75" stroke="#E52345" strokeWidth="4" strokeLinecap="round" />
                  <path d="M141 71H149" stroke="#E52345" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Renyah Tahan Lama</h3>
              <p>Tekstur 'kriuk' konsisten berkat teknik penggorengan khusus.</p>
            </div>

            {/* Card 4: Kemasan Higienis */}
            <div className="why-card">
              <div className="why-card-icon teal">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 200"
                  width="34"
                  height="34"
                  fill="none"
                >
                  {/* Lingkaran utama */}
                  <circle cx="100" cy="100" r="70" stroke="#E52345" strokeWidth="8" />

                  {/* Kemasan */}
                  <path
                    d="M68 72 L100 60 L132 72 V130 C132 136 128 140 122 140 H78 C72 140 68 136 68 130 V72Z"
                    fill="#FFFFFF"
                    stroke="#111111"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />

                  {/* Bagian atas kemasan */}
                  <path d="M68 72L100 84L132 72" stroke="#111111" strokeWidth="4" strokeLinejoin="round" />

                  {/* Garis tengah kemasan */}
                  <path d="M100 84V139" stroke="#111111" strokeWidth="3" />

                  {/* Label pada kemasan */}
                  <rect x="79" y="96" width="42" height="25" rx="4" fill="#FFFFFF" stroke="#E52345" strokeWidth="3" />

                  {/* Check mark */}
                  <path d="M87 108L94 115L108 101" stroke="#E52345" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Shield */}
                  <path
                    d="M139 113 C139 113 151 117 151 117 V128 C151 138 145 145 139 149 C133 145 127 138 127 128 V117 C127 117 139 113 139 113Z"
                    fill="#FFFFFF"
                    stroke="#E52345"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />

                  {/* Check pada shield */}
                  <path d="M132 130L137 135L146 125" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Sparkle kebersihan */}
                  <path d="M61 67V78" stroke="#E52345" strokeWidth="4" strokeLinecap="round" />
                  <path d="M56 72.5H66" stroke="#E52345" strokeWidth="4" strokeLinecap="round" />
                  <path d="M145 67V75" stroke="#E52345" strokeWidth="4" strokeLinecap="round" />
                  <path d="M141 71H149" stroke="#E52345" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Kemasan Higienis</h3>
              <p>Plastik food-grade tebal dengan segel rapat menjamin kebersihan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cerita Dari Owner Section (Full-Width Background dengan Frosted Glass Cards) */}
      <section className="about-owner-story-section">
        {/* Dark Dimmed Overlay over the Kitchen Background */}
        <div className="about-owner-overlay" />

        <div className="container about-owner-container">
          <div className="about-owner-content">
            <h2 className="about-owner-heading">Cerita Dari Owner</h2>

            <div className="about-owner-paragraphs">
              <p>
                Lakstari berawal dari sebuah dapur kecil di Junrejo, Kota Batu. Dengan dedikasi tinggi terhadap
                cita rasa Nusantara, kami memadukan tempe berkualitas dengan kelembutan sagu pilihan.
              </p>
              <p>
                Setiap keping keripik tempe sagu Lakstari diproses dengan penuh cinta dan standar kebersihan
                tinggi. Kami percaya bahwa camilan yang baik bukan hanya tentang rasa, tetapi juga tentang
                kenangan hangat yang dihadirkannya di setiap gigitan.
              </p>
            </div>

            {/* 2 Frosted Glass Feature Cards */}
            <div className="about-owner-cards-grid">
              <div className="owner-glass-card">
                <div className="owner-glass-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="owner-glass-text">
                  <h4>Asli Kota Batu</h4>
                  <p>Diproduksi langsung dari sumber bahan baku terbaik.</p>
                </div>
              </div>

              <div className="owner-glass-card">
                <div className="owner-glass-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div className="owner-glass-text">
                  <h4>Resep Keluarga</h4>
                  <p>Kelezatan autentik yang diwariskan turun-temurun.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Momen Bersama Lakstari Section (Auto-Play Carousel Slider) */}
      <section className="about-moments-section">
        <div className="container moments-container-wide">
          <div className="about-moments-header">
            <h2 className="about-moments-title">Momen Bersama Lakstari</h2>
            <p className="about-moments-subtitle">
              Kebahagiaan di setiap gigitan renyah.
            </p>
          </div>

          {/* Carousel Slider Container (Mendukung Geser Mouse & Sentuh Layar Langsung) */}
          <div 
            className={`moments-slider-wrapper ${isDragging ? 'is-dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="moments-slider-track"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(calc(-${currentIndex} * ((100% + var(--slider-gap, 20px)) / var(--visible-slides, 4)) + ${dragOffset}px))`,
                transition: isDragging || !isTransitioning ? 'none' : 'transform 0.85s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {displaySlides.map((slide, idx) => (
                <div key={`${slide.id}-${idx}`} className="moment-slide-card">
                  <div className="moment-img-wrapper">
                    <img
                      src={slide.img}
                      alt={slide.alt}
                      className="moment-img"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Clickable Pagination Dots */}
          <div className="moments-dots-container">
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`moments-dot ${(currentIndex % totalDots) === idx ? 'active' : ''}`}
                onClick={() => handleDotClick(idx)}
                aria-label={`Slide ke-${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Lokasi Toko & Google Maps Section */}
      <section className="about-location-section">
        <div className="container">
          <div className="about-location-header">
            <h2 className="about-location-title">Kunjungi Toko Kami</h2>
            <p className="about-location-subtitle">
              Temukan kelezatan kripik tempe renyah langsung di lokasi kami.
            </p>
          </div>

          <div className="about-location-grid">
            {/* Kartu Informasi Lokasi & Jam Operasional */}
            <div className="location-info-card">
              <h3 className="location-brand-name">Kripik Tempe Lakstari</h3>
              
              <div className="location-item">
                <div className="location-item-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-house">
                    <path d="M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z"/>
                    <path d="M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2"/>
                    <path d="M18 22v-3"/>
                    <circle cx="10" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="location-item-text">
                  <h4>Alamat</h4>
                  <p>Griya Permata Mulya No.Kav 8, Pendem, Kec. Junrejo, Kota Batu, Jawa Timur 65321</p>
                </div>
              </div>

              <div className="location-item">
                <div className="location-item-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="location-item-text">
                  <h4>Jam Operasional</h4>
                  <p>Senin - Sabtu: 08.00 - 17.00 WIB</p>
                  <span className="location-subtext">Minggu & Hari Libur Nasional: Tutup</span>
                </div>
              </div>

              <div className="location-item">
                <div className="location-item-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-contact">
                    <path d="M16 2v2"/>
                    <path d="M7 21v-2a2 2 0 012-2h6a2 2 0 012 2v2"/>
                    <path d="M8 2v2"/>
                    <circle cx="12" cy="10" r="3"/>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                  </svg>
                </div>
                <div className="location-item-text">
                  <h4>Kontak & Pemesanan</h4>
                  <p>+62 823-4007-4645</p>
                  <span className="location-subtext">info@lakstari.com</span>
                </div>
              </div>

              <a 
                href="https://maps.google.com/?q=Griya+Permata+Mulya+No.Kav+8+Pendem+Kec+Junrejo+Kota+Batu+Jawa+Timur+65321" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-open-maps"
              >
                <span>Buka di Google Maps</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>

            {/* Google Maps Frame (Mode Satelit) */}
            <div className="location-map-frame">
              <iframe
                title="Google Maps Lokasi Kripik Tempe Lakstari (Satelit)"
                src="https://maps.google.com/maps?q=Griya%20Permata%20Mulya%20No.Kav%208,%20Pendem,%20Kec.%20Junrejo,%20Kota%20Batu,%20Jawa%20Timur%2065321&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
