import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useNotif } from '@/components/ui/notif';

export interface CartItem {
  id: string; // Unique ID for cart item (productName + variant)
  productId?: number;
  productName: string;
  variant: string;
  priceStr: string;
  priceRaw: number;
  quantity: number;
  stock?: number;
  weight?: string;
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity' | 'priceRaw'>) => boolean;
  updateQuantity: (id: string, delta: number) => boolean;
  removeFromCart: (id: string) => void;
  toggleCart: (isOpen?: boolean) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showNotif } = useNotif();

  const parsePrice = (priceStr: string) => {
    return Number(priceStr.replace(/[^0-9]/g, ''));
  };

  const toggleCart = (isOpen?: boolean) => {
    setIsCartOpen((prev) => (isOpen !== undefined ? isOpen : !prev));
  };

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity' | 'priceRaw'>): boolean => {
    const uniqueId = `${item.productName}-${item.variant}`;
    const maxStock = item.stock !== undefined ? item.stock : 999;

    if (maxStock <= 0) {
      showNotif({
        type: 'warning',
        message: 'Stok Habis'
      });
      return false;
    }

    const existingItem = cartItems.find((i) => i.id === uniqueId);

    // Jika sudah mencapai batas stok maksimal
    if (existingItem && existingItem.quantity >= maxStock) {
      showNotif({
        type: 'warning',
        message: 'Stok Habis'
      });
      return false;
    }

    setCartItems((prevItems) => {
      const exists = prevItems.find((i) => i.id === uniqueId);
      if (exists) {
        return prevItems.map((i) =>
          i.id === uniqueId ? { ...i, quantity: i.quantity + 1, stock: maxStock } : i
        );
      }

      return [
        ...prevItems,
        {
          ...item,
          id: uniqueId,
          quantity: 1,
          stock: maxStock,
          priceRaw: parsePrice(item.priceStr),
        },
      ];
    });

    // Notifikasi sukses
    showNotif({
      type: 'success',
      message: 'Berhasil Ditambahkan'
    });

    return true;
  };

  const updateQuantity = (id: string, delta: number): boolean => {
    const target = cartItems.find((i) => i.id === id);
    if (!target) return false;

    const maxStock = target.stock !== undefined ? target.stock : 999;

    // Cegah penambahan jika sudah mencapai batas stok
    if (delta > 0 && target.quantity >= maxStock) {
      showNotif({
        type: 'warning',
        message: 'Stok Habis'
      });
      return false;
    }

    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );

    return true;
  };

  const removeFromCart = (id: string) => {
    const target = cartItems.find((i) => i.id === id);
    if (target) {
      showNotif({
        type: 'info',
        message: 'Item Dihapus dari Keranjang'
      });
    }
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.priceRaw * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
