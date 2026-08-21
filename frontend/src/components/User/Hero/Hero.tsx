import React, { useState, useEffect } from 'react';
import './Hero.css';

const images = [
  '/images/hero/hero-tempeh.png',
  '/images/hero/product-tempeh-bowl.png',
  '/images/hero/product-tempeh-pouch.png'
];

const Spiral = ({ style }: { style: React.CSSProperties }) => (
  <img
    src="/images/decorations/spiral-decoration.png"
    alt=""
    aria-hidden="true"
    style={{
      position: 'absolute',
      zIndex: 0,
      opacity: 0.32,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style,
    }}
  />
);

const Hero = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 3000); // Ganti gambar setiap 3 detik

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Spiral Decorations (Ukuran Ramping & Lebih Banyak) */}
      <Spiral style={{ top: '6%', left: '3%', width: '80px', transform: 'rotate(15deg)' }} />
      <Spiral style={{ top: '22%', left: '12%', width: '65px', transform: 'rotate(85deg)' }} />
      <Spiral style={{ top: '48%', left: '2%', width: '90px', transform: 'rotate(-45deg)' }} />
      <Spiral style={{ top: '72%', left: '8%', width: '75px', transform: 'rotate(35deg)' }} />
      <Spiral style={{ top: '90%', left: '22%', width: '85px', transform: 'rotate(-75deg)' }} />

      <Spiral style={{ top: '8%', left: '35%', width: '70px', transform: 'rotate(40deg)' }} />
      <Spiral style={{ top: '38%', left: '42%', width: '80px', transform: 'rotate(110deg)' }} />
      <Spiral style={{ top: '78%', left: '46%', width: '95px', transform: 'rotate(-25deg)' }} />

      <Spiral style={{ top: '5%', right: '28%', width: '75px', transform: 'rotate(65deg)' }} />
      <Spiral style={{ top: '28%', right: '36%', width: '85px', transform: 'rotate(-50deg)' }} />
      <Spiral style={{ top: '60%', right: '28%', width: '70px', transform: 'rotate(130deg)' }} />
      <Spiral style={{ top: '88%', right: '35%', width: '80px', transform: 'rotate(20deg)' }} />

      <Spiral style={{ top: '8%', right: '10%', width: '85px', transform: 'rotate(50deg)' }} />
      <Spiral style={{ top: '35%', right: '3%', width: '95px', transform: 'rotate(-30deg)' }} />
      <Spiral style={{ top: '68%', right: '4%', width: '75px', transform: 'rotate(95deg)' }} />
      <Spiral style={{ top: '92%', right: '14%', width: '90px', transform: 'rotate(-60deg)' }} />

      {/* Logo PIRT di kiri atas, sejajar dengan logo Halal di kanan */}
      <div className="hero-pirt-left">
        <img src="/images/badges/pirt.png" alt="PIRT" />
      </div>

      {/* Logo Halal di kanan atas, persis di bawah logo WhatsApp Header */}
      <div className="hero-halal-right">
        <img src="/images/badges/halal.svg" alt="Halal Indonesia" />
      </div>

      <div className="hero-text">
        <span className="hero-badge">PREMIUM QUALITY SNACK</span>
        <h1>Kripik Tempe Lakstari</h1>
        <p>Renyah, Gurih, Nagih. Camilan tradisional kualitas premium yang diolah dengan resep rahasia keluarga.</p>
      </div>
      <div className="hero-image-wrapper">
        {images.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={`Kripik Tempe ${idx + 1}`}
            className={`hero-img ${idx === currentIdx ? 'active' : ''}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
