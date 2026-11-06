'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Product } from '@/types/product';

// Define the shape of an item in the cart
export interface CartItem extends Product {
  quantity: number;
  selectedWeight?: string;
  cartItemId?: string;
}

// Accept normal products and optional preselected quantity & weight from callers
export type AddToCartInput = Product & {
  quantity?: number;
  selectedWeight?: string;
};

// Define the shape of the context value
interface ICartContext {
  cartItems: CartItem[];
  addToCart: (product: AddToCartInput) => void;
  removeFromCart: (idOrKey: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  updateQuantity: (idOrKey: string, quantity: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

// Create the context with a default value
const CartContext = createContext<ICartContext | undefined>(undefined);

// Create the provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (err) {
        console.error('Failed to parse stored cart:', err);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: AddToCartInput) => {
    const maxStock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : Infinity;
    if (maxStock <= 0) return;

    const quantityToAdd = Math.max(1, product.quantity ?? 1);
    const weightLabel = product.selectedWeight || product.weight || '1kg';
    const uniqueKey = `${product._id}-${weightLabel}`;

    setCartItems((prevItems) => {
      const totalForProduct = prevItems
        .filter((i) => i._id === product._id)
        .reduce((sum, i) => sum + i.quantity, 0);
      const allowedAdd = Math.max(0, Math.min(quantityToAdd, maxStock - totalForProduct));
      if (allowedAdd <= 0) return prevItems;

      const existingItem = prevItems.find((item) => 
        (item.cartItemId && item.cartItemId === uniqueKey) || 
        (item._id === product._id && (item.selectedWeight || '1kg') === weightLabel)
      );

      if (existingItem) {
        return prevItems.map((item) =>
          ((item.cartItemId && item.cartItemId === uniqueKey) || (item._id === product._id && (item.selectedWeight || '1kg') === weightLabel))
            ? { ...item, stock: product.stock, quantity: item.quantity + allowedAdd }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            ...product,
            cartItemId: uniqueKey,
            selectedWeight: weightLabel,
            quantity: allowedAdd,
          },
        ];
      }
    });
  };

  const removeFromCart = (idOrKey: string) => {
    setCartItems((prevItems) => {
      return prevItems.filter((item) => (item.cartItemId || item._id) !== idOrKey && item._id !== idOrKey);
    });
  };

  const updateQuantity = (idOrKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(idOrKey);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if ((item.cartItemId || item._id) === idOrKey || item._id === idOrKey) {
          const maxStock = item.stock !== undefined && item.stock !== null ? Number(item.stock) : Infinity;
          const otherWeightQty = prevItems
            .filter((other) => other._id === item._id && (other.cartItemId || other._id) !== (item.cartItemId || item._id))
            .reduce((sum, other) => sum + other.quantity, 0);
          const cappedQty = Math.max(1, Math.min(quantity, Math.max(1, maxStock - otherWeightQty)));
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartTotal, updateQuantity, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

// Create a custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
