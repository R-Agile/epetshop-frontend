import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, User } from '@/types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getCartQuantity: (productId: string) => number;
  cartTotal: number;
  cartCount: number;
  loadCart: () => void;
  loadWishlist: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  user: User | null;
}

export const CartProvider = ({ children, user }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [guestId, setGuestId] = useState<string>('');

  // Initialize guest ID from localStorage or create new one
  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestId');
    if (storedGuestId) {
      setGuestId(storedGuestId);
    } else {
      const newGuestId = crypto.randomUUID();
      localStorage.setItem('guestId', newGuestId);
      setGuestId(newGuestId);
    }
  }, []);

  // Load guest cart/wishlist on mount
  useEffect(() => {
    if (guestId) {
      loadGuestCart();
      loadGuestWishlist();
    }
  }, [guestId]);

  const loadGuestCart = () => {
    const stored = localStorage.getItem(`guestCart_${guestId}`);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse guest cart:', error);
        localStorage.removeItem(`guestCart_${guestId}`);
      }
    }
  };

  const loadGuestWishlist = () => {
    const stored = localStorage.getItem(`guestWishlist_${guestId}`);
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse guest wishlist:', error);
        localStorage.removeItem(`guestWishlist_${guestId}`);
      }
    }
  };

  const saveGuestCart = (cartItems: CartItem[]) => {
    if (guestId) {
      localStorage.setItem(`guestCart_${guestId}`, JSON.stringify(cartItems));
    }
  };

  const saveGuestWishlist = (wishlistItems: Product[]) => {
    if (guestId) {
      localStorage.setItem(`guestWishlist_${guestId}`, JSON.stringify(wishlistItems));
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    // Using localStorage for all users (guest and logged-in)
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let newItems;
      if (existing) {
        toast.success(`Updated ${product.name} quantity in cart`);
        newItems = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success(`Added ${product.name} to cart`);
        newItems = [...prev, { product, quantity }];
      }
      saveGuestCart(newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.product.id !== productId);
      saveGuestCart(newItems);
      return newItems;
    });
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      saveGuestCart(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    if (guestId) {
      localStorage.removeItem(`guestCart_${guestId}`);
    }
    toast.info('Cart cleared');
  };

  const addToWishlist = (product: Product) => {
    if (!wishlist.find(p => p.id === product.id)) {
      setWishlist(prev => {
        const newWishlist = [...prev, product];
        saveGuestWishlist(newWishlist);
        return newWishlist;
      });
      toast.success(`Added ${product.name} to wishlist`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => {
      const newWishlist = prev.filter(p => p.id !== productId);
      saveGuestWishlist(newWishlist);
      return newWishlist;
    });
    toast.info('Item removed from wishlist');
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  const getCartQuantity = (productId: string): number => {
    const item = items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const cartTotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  // Stub functions - not used with localStorage approach
  const loadCart = () => {
    loadGuestCart();
  };

  const loadWishlist = () => {
    loadGuestWishlist();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getCartQuantity,
        cartTotal,
        cartCount,
        loadCart,
        loadWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
