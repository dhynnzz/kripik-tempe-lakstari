import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import './FloatingCart.css';

const FloatingCart: React.FC = () => {
  const { totalItems, toggleCart, isCartOpen } = useCart();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    hasMoved: boolean;
    activePointerId: number | null;
  }>({
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
    hasMoved: false,
    activePointerId: null,
  });

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Set default initial position on mount & handle window resizing
  useEffect(() => {
    const updateDefaultPosition = () => {
      const btnSize = document.documentElement.clientWidth <= 768 ? 60 : 70;
      const margin = document.documentElement.clientWidth <= 768 ? 20 : 36;
      const defaultX = document.documentElement.clientWidth - btnSize - margin;
      const defaultY = document.documentElement.clientHeight - btnSize - margin;

      setPosition((prev) => {
        if (!prev) {
          return { x: defaultX, y: defaultY };
        }
        // Clamp current position within new window bounds
        const maxX = document.documentElement.clientWidth - btnSize - margin;
        const maxY = document.documentElement.clientHeight - btnSize - margin;
        return {
          x: Math.min(Math.max(prev.x, margin), maxX),
          y: Math.min(Math.max(prev.y, margin), maxY),
        };
      });
    };

    updateDefaultPosition();
    window.addEventListener('resize', updateDefaultPosition);
    return () => window.removeEventListener('resize', updateDefaultPosition);
  }, []);
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    try {
      buttonRef.current.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if unsupported
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const currentPosX = rect.left;
    const currentPosY = rect.top;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: currentPosX,
      initialPosY: currentPosY,
      hasMoved: false,
      activePointerId: e.pointerId,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.activePointerId !== e.pointerId) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // Threshold to distinguish between click and drag
    if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 5) {
      dragRef.current.hasMoved = true;
      setIsDragging(true);
    }

    if (dragRef.current.hasMoved) {
      const btnWidth = buttonRef.current ? buttonRef.current.offsetWidth : 60;
      const btnHeight = buttonRef.current ? buttonRef.current.offsetHeight : 60;
      
      const margin = document.documentElement.clientWidth <= 768 ? 20 : 36;
      
      const minX = margin;
      const maxX = document.documentElement.clientWidth - btnWidth - margin;
      const minY = margin;
      const maxY = document.documentElement.clientHeight - btnHeight - margin;

      const newX = Math.min(Math.max(dragRef.current.initialPosX + dx, minX), maxX);
      const newY = Math.min(Math.max(dragRef.current.initialPosY + dy, minY), maxY);

      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.activePointerId !== e.pointerId) return;

    if (buttonRef.current) {
      try {
        buttonRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }

    const wasDragging = dragRef.current.hasMoved;
    dragRef.current.activePointerId = null;
    setIsDragging(false);

    // Only trigger cart drawer when it was a click/tap without dragging
    if (!wasDragging) {
      toggleCart();
    } else if (position) {
      // Magnetic snap effect: geser ke sisi kiri atau kanan layar terdekat
      const btnWidth = buttonRef.current ? buttonRef.current.offsetWidth : 70;
      const margin = document.documentElement.clientWidth <= 768 ? 20 : 36;
      const minX = margin;
      const maxX = document.documentElement.clientWidth - btnWidth - margin;
      
      const centerOfScreen = document.documentElement.clientWidth / 2;
      const btnCenter = position.x + (btnWidth / 2);
      
      const snapX = btnCenter < centerOfScreen ? minX : maxX;
      
      setPosition({ x: snapX, y: position.y });
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.activePointerId === e.pointerId) {
      dragRef.current.activePointerId = null;
      setIsDragging(false);
    }
  };

  // Only apply absolute positioning style if user has explicitly dragged it
  const style: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: 'auto',
        right: 'auto',
        display: isCartOpen ? 'none' : undefined,
      }
    : {
        display: isCartOpen ? 'none' : undefined,
      };

  return (
    <button
      ref={buttonRef}
      className={`floating-cart-btn ${isDragging ? 'is-dragging' : ''} ${isCartOpen ? 'is-cart-open' : ''}`}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      title="Keranjang Belanja (Bisa digeser ke mana saja)"
      aria-label="Buka Keranjang Belanja"
    >
      <div className="cart-icon-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="cart-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="21" r="1.2" />
          <circle cx="19" cy="21" r="1.2" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </div>
    </button>
  );
};

export default FloatingCart;
