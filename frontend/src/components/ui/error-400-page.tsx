import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants matching the 21st.dev smooth curve standard
const containerVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
};

const numberVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5,
  }),
  visible: {
    opacity: 0.85,
    x: 0,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
};

const mascotVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 15,
    rotate: -5,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
  hover: {
    scale: 1.1,
    y: -10,
    rotate: [0, -6, 6, -4, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut" as const,
    },
  },
  floating: {
    y: [-6, 6],
    transition: {
      y: {
        duration: 2.2,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  },
};

const bubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.6 },
  visible: (i: number) => ({
    opacity: [0.3, 0.9, 0.3],
    y: [-5, -25, -5],
    scale: [0.9, 1.1, 0.9],
    transition: {
      duration: 2.5 + i * 0.4,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: i * 0.3,
    },
  }),
};

export interface Error400PageProps {
  title?: string;
  description?: string;
  details?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  homeUrl?: string;
}

export function Error400Page({
  title = "Aduh! Permintaan Tidak Dipahami",
  description = "Format data atau parameter yang dikirim oleh browser tidak sesuai dan tidak dapat diproses oleh server kami.",
  details = "Kode HTTP: 400 Bad Request — Server menolak memproses permintaan karena sintaks, parameter, atau header yang dikirim tidak valid.",
  onRetry,
  onGoHome,
  homeUrl = "/",
}: Error400PageProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleHomeClick = (e: React.MouseEvent) => {
    if (onGoHome) {
      e.preventDefault();
      onGoHome();
    } else if (homeUrl) {
      window.location.href = homeUrl;
    }
  };

  const handleRetryClick = (e: React.MouseEvent) => {
    if (onRetry) {
      e.preventDefault();
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        padding: "24px 16px",
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Subtle Gradient Glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(250, 172, 48, 0.08) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          style={{
            textAlign: "center",
            maxWidth: "640px",
            width: "100%",
            zIndex: 1,
            position: "relative",
          }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >

          {/* Animated 4 - [Mascot Zero] - 0 Display */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "28px",
              userSelect: "none",
            }}
          >
            {/* First Digit: 4 */}
            <motion.span
              style={{
                fontSize: "clamp(80px, 16vw, 130px)",
                fontWeight: 800,
                color: "#1E293B",
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
              variants={numberVariants}
              custom={-1}
            >
              4
            </motion.span>

            {/* Middle Element: Mascot acting as the first '0' in '400' */}
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Floating Confused Question Marks / Sparks */}
              <motion.span
                custom={0}
                variants={bubbleVariants}
                initial="hidden"
                animate="visible"
                style={{
                  position: "absolute",
                  top: "-18px",
                  right: "-10px",
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#FAAC30",
                  pointerEvents: "none",
                }}
              >
                ?
              </motion.span>
              <motion.span
                custom={1}
                variants={bubbleVariants}
                initial="hidden"
                animate="visible"
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "-12px",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              >
                ¿
              </motion.span>

              <motion.div
                variants={mascotVariants}
                whileHover="hover"
                animate={["visible", "floating"]}
                style={{
                  width: "clamp(80px, 15vw, 120px)",
                  height: "clamp(80px, 15vw, 120px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {!imgFailed ? (
                  <img
                    src="https://cdn.21st.dev/assets/mirror/88/8848c4fd858052c49c5a5d7267489c02b021c6cf3e31bfec02787e16f1ab7d0e.png"
                    alt="400 Confused Mascot"
                    width={120}
                    height={120}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      userSelect: "none",
                      filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.08))",
                    }}
                    draggable={false}
                    onError={() => setImgFailed(true)}
                  />
                ) : (
                  /* High Quality Vector Fallback if image fails to load */
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="50" cy="50" r="44" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="4" />
                    {/* Swirly / Confused Eyes */}
                    <circle cx="36" cy="44" r="5" fill="#1E293B" />
                    <circle cx="64" cy="44" r="5" fill="#1E293B" />
                    <line x1="32" y1="36" x2="42" y2="40" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                    <line x1="68" y1="36" x2="58" y2="40" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                    {/* Wobbly confused mouth */}
                    <path
                      d="M 38 64 Q 44 58 50 64 Q 56 70 62 64"
                      stroke="#1E293B"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
              </motion.div>
            </div>

            {/* Last Digit: 0 */}
            <motion.span
              style={{
                fontSize: "clamp(80px, 16vw, 130px)",
                fontWeight: 800,
                color: "#1E293B",
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
              variants={numberVariants}
              custom={1}
            >
              0
            </motion.span>
          </div>

          {/* Heading */}
          <motion.h1
            style={{
              fontSize: "clamp(24px, 5vw, 36px)",
              fontWeight: 800,
              color: "#0F172A",
              marginBottom: "14px",
              lineHeight: 1.25,
            }}
            variants={itemVariants}
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            style={{
              fontSize: "clamp(15px, 2.5vw, 17px)",
              color: "#64748B",
              marginBottom: "32px",
              lineHeight: 1.6,
              maxWidth: "520px",
              margin: "0 auto 32px auto",
            }}
            variants={itemVariants}
          >
            {description}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* Primary Action Button: Refresh / Retry */}
            <motion.button
              onClick={handleRetryClick}
              whileHover={{
                scale: 1.04,
                boxShadow: "0 10px 20px -5px rgba(250, 172, 48, 0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#1E293B",
                color: "#FFFFFF",
                padding: "12px 28px",
                borderRadius: "9999px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                transition: "background-color 0.2s ease",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              Periksa & Coba Lagi
            </motion.button>

            {/* Secondary Action Button: Back to Home */}
            <motion.button
              onClick={handleHomeClick}
              whileHover={{
                scale: 1.04,
                backgroundColor: "#F1F5F9",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#F8FAFC",
                color: "#334155",
                border: "1px solid #CBD5E1",
                padding: "12px 24px",
                borderRadius: "9999px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.2s ease, border-color 0.2s ease",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Kembali ke Beranda
            </motion.button>
          </motion.div>

          {/* Technical Details Toggle */}
          <motion.div
            variants={itemVariants}
            style={{
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              style={{
                background: "none",
                border: "none",
                color: "#64748B",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 8px",
              }}
            >
              <span>{showTechnicalDetails ? "Sembunyikan Info Teknis" : "Mengapa error 400 terjadi? "}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: showTechnicalDetails ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showTechnicalDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginTop: "12px",
                  textAlign: "left",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  fontSize: "12.5px",
                  color: "#475569",
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: 600, color: "#1E293B", marginBottom: "4px" }}>
                  Penyebab Umum Error 400 Bad Request:
                </div>
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  <li>Karakter tidak valid atau sintaks rusak pada URL browser.</li>
                  <li>Data formulir (payload) yang dikirim tidak sesuai dengan format JSON / API backend.</li>
                  <li>Cookie atau sesi browser lawas yang bermasalah. Coba hapus cache browser jika masalah berulang.</li>
                </ul>
                <div style={{ marginTop: "8px", fontStyle: "italic", color: "#64748B" }}>
                  {details}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Default export as well for flexibility
export default Error400Page;
