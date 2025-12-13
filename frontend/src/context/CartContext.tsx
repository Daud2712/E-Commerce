import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import { IProduct } from '../types';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: IProduct;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: IProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const isLoadingCartRef = useRef(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load user-specific cart when user logs in or changes
  // This MUST run before the save effect to prevent overwriting saved data
  useEffect(() => {
    // Set flag to prevent saving while loading
    isLoadingCartRef.current = true;

    if (userId) {
      const savedCart = localStorage.getItem(`cart_${userId}`);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } else {
      // Clear cart display when user logs out, but keep data in localStorage
      // This way, when the user logs back in, their cart will be restored
      setCartItems([]);
    }
  }, [userId]);

  // Save cart to user-specific localStorage whenever it changes
  // Skip saving when we're loading from localStorage to prevent overwriting
  useEffect(() => {
    if (userId && !isLoadingCartRef.current) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
    }
    // Reset the loading flag after the save attempt
    isLoadingCartRef.current = false;
  }, [cartItems, userId]);

  const addToCart = (product: IProduct, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product._id === product._id);

      if (existingItem) {
        // Update quantity if item already in cart
        return prevItems.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    // Also clear from localStorage for this user
    // Note: This is for intentional cart clearing (e.g., after successful checkout)
    // Not called on logout - cart persists in localStorage for future logins
    if (userId) {
      localStorage.removeItem(`cart_${userId}`);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
