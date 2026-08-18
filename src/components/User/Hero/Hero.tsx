import { useState, useEffect } from 'react';
import './Hero.css';

const images = [
  '/hero_tempeh.png',
  '/product_tempeh_bowl.png',
  '/product_tempeh_pouch.png'
];

const Spiral = ({ style }: { style: React.CSSProperties }) => (
  <svg
    width="60" height="60" viewBox="0 0 100 100" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', zIndex: -1, opacity: 0.08, ...style }}
  >
    <path
      d="M50 50 C 50 42, 58 42, 58 50 C 58 62, 42 62, 42 50 C 42 34, 66 34, 66 50 C 66 70, 34 70, 34 50 C 34 26, 74 26, 74 50 C 74 78, 26 78, 26 50"
      stroke="#D97706"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
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
    <section className="hero">
      {/* Background Decorations */}
      <Spiral style={{ top: '15%', left: '5%', transform: 'rotate(15deg) scale(1.5)' }} />
      <Spiral style={{ top: '65%', left: '8%', transform: 'rotate(-45deg) scale(2)' }} />
      <Spiral style={{ top: '35%', left: '35%', transform: 'rotate(70deg) scale(1.2)' }} />
      <Spiral style={{ top: '85%', left: '40%', transform: 'rotate(120deg) scale(1.6)' }} />
      <Spiral style={{ top: '10%', right: '15%', transform: 'rotate(40deg) scale(1.8)' }} />
      <Spiral style={{ top: '55%', right: '5%', transform: 'rotate(-20deg) scale(2.2)' }} />
      <Spiral style={{ top: '90%', right: '25%', transform: 'rotate(80deg) scale(1.4)' }} />
      <Spiral style={{ top: '25%', right: '45%', transform: 'rotate(-60deg) scale(1.7)' }} />
      <Spiral style={{ top: '5%', left: '45%', transform: 'rotate(10deg) scale(1.3)' }} />

      <div className="hero-text">
        <span className="hero-badge">PREMIUM QUALITY SNACK</span>
        <h1>Kripik Tempe<br />Lakstari</h1>
        <p>Renyah, Gurih, Nagih. Camilan tradisional kualitas premium yang diolah dengan resep rahasia keluarga.</p>
      </div>
      <div className="hero-image-wrapper">
        <div className="hero-certifications hero-cert-right">
          <div className="cert-logo">
            <img src="/PIRT.png" alt="PIRT" />
          </div>
          <div className="cert-logo">
            <img src="/halal.png" alt="Halal Indonesia" />
          </div>
        </div>
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
