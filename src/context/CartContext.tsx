import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
export interface CartItem {
  id: string; // Unique ID for cart item (productName + variant)
  productId?: number;
  productName: string;
  variant: string;
  priceStr: string;
  priceRaw: number;
  quantity: number;
  weight?: string;
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity' | 'priceRaw'>) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  toggleCart: (isOpen?: boolean) => void;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
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

  const parsePrice = (priceStr: string) => {
    return Number(priceStr.replace(/[^0-9]/g, ''));
  };

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity' | 'priceRaw'>) => {
    setCartItems((prevItems) => {
      const uniqueId = `${item.productName}-${item.variant}`;
      const existingItem = prevItems.find((i) => i.id === uniqueId);

      if (existingItem) {
        // If it exists, increase quantity
        return prevItems.map((i) =>
          i.id === uniqueId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      // If new, add it
      return [
        ...prevItems,
        {
          ...item,
          id: uniqueId,
          quantity: 1,
          priceRaw: parsePrice(item.priceStr),
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0) // Remove if quantity reaches 0
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const toggleCart = (isOpen?: boolean) => {
    setIsCartOpen((prev) => (isOpen !== undefined ? isOpen : !prev));
  };

  const clearCart = () => {
    setCartItems([]);
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
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
