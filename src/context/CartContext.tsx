import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, User } from '@/types';
import { toast } from 'sonner';
import { cartService } from '@/services/cart.service';

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
    if (guestId && !user?.id) {
      loadGuestCart();
      loadGuestWishlist();
    }
  }, [guestId]);

  // Load cart and wishlist when user logs in
  useEffect(() => {
    if (user?.id) {
      // Merge guest cart/wishlist with user account
      mergeGuestDataWithUser();
      loadCart();
      loadWishlist();
    }
  }, [user?.id]);

  const loadGuestCart = () => {
    const stored = localStorage.getItem(`guestCart_${guestId}`);
    if (stored) {
      setItems(JSON.parse(stored));
    }
  };

  const loadGuestWishlist = () => {
    const stored = localStorage.getItem(`guestWishlist_${guestId}`);
    if (stored) {
      setWishlist(JSON.parse(stored));
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

  const mergeGuestDataWithUser = async () => {
    if (!user?.id || !guestId) return;

    try {
      const guestCart = JSON.parse(localStorage.getItem(`guestCart_${guestId}`) || '[]');
      const guestWishlistData = JSON.parse(localStorage.getItem(`guestWishlist_${guestId}`) || '[]');

      // Add guest cart items to user cart
      for (const item of guestCart) {
        await cartService.addToCart({
          user_id: user.id,
          product_id: item.product.id,
          quantity: item.quantity,
        });
      }

      // Add guest wishlist items to user wishlist
      for (const product of guestWishlistData) {
        await cartService.addToWishlist({
          user_id: user.id,
          product_id: product.id,
        });
      }

      // Clear guest data
      localStorage.removeItem(`guestCart_${guestId}`);
      localStorage.removeItem(`guestWishlist_${guestId}`);
    } catch (error) {
      console.error('Failed to merge guest data:', error);
    }
  };

  const loadCart = async () => {
    if (!user?.id) return;
    try {
      const cartItems = await cartService.getCart(user.id);
      // Note: You'll need to fetch product details for each cart item
      // For now, we'll just set the cart structure
      // This would need additional API calls to get product details
      console.log('Cart items loaded:', cartItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const loadWishlist = async () => {
    if (!user?.id) return;
    try {
      const wishlistItems = await cartService.getWishlist(user.id);
      // Similar to cart, you'll need to fetch product details
      console.log('Wishlist items loaded:', wishlistItems);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (!user?.id) {
      // Guest user - store in localStorage
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
      return;
    }

    try {
      await cartService.addToCart({
        user_id: user.id,
        product_id: product.id,
        quantity,
      });

      setItems(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
          toast.success(`Updated ${product.name} quantity in cart`);
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        toast.success(`Added ${product.name} to cart`);
        return [...prev, { product, quantity }];
      });
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error(error);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user?.id) {
      // Guest user
      setItems(prev => {
        const newItems = prev.filter(item => item.product.id !== productId);
        saveGuestCart(newItems);
        return newItems;
      });
      toast.info('Item removed from cart');
      return;
    }

    try {
      // Find the cart item ID from backend
      const cartItems = await cartService.getCart(user.id);
      const cartItem = cartItems.find(item => item.product_id === productId);
      
      if (cartItem) {
        await cartService.removeFromCart(cartItem._id);
      }

      setItems(prev => prev.filter(item => item.product.id !== productId));
      toast.info('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove from cart');
      console.error(error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (!user?.id) return;

    try {
      const cartItems = await cartService.getCart(user.id);
      const cartItem = cartItems.find(item => item.product_id === productId);
      
      if (cartItem) {
        await cartService.updateCartQuantity(cartItem._id, quantity);
      }

      setItems(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error(error);
    }
  };

  const clearCart = async () => {
    if (!user?.id) return;

    try {
      await cartService.clearCart(user.id);
      setItems([]);
      toast.info('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
      console.error(error);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!user?.id) {
      // Guest user - store in localStorage
      if (!wishlist.find(p => p.id === product.id)) {
        setWishlist(prev => {
          const newWishlist = [...prev, product];
          saveGuestWishlist(newWishlist);
          return newWishlist;
        });
        toast.success(`Added ${product.name} to wishlist`);
      }
      return;
    }

    if (!wishlist.find(p => p.id === product.id)) {
      try {
        await cartService.addToWishlist({
          user_id: user.id,
          product_id: product.id,
        });

        setWishlist(prev => [...prev, product]);
        toast.success(`Added ${product.name} to wishlist`);
      } catch (error) {
        toast.error('Failed to add to wishlist');
        console.error(error);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user?.id) return;

    try {
      const wishlistItems = await cartService.getWishlist(user.id);
      const wishlistItem = wishlistItems.find(item => item.product_id === productId);
      
      if (wishlistItem) {
        await cartService.removeFromWishlist(wishlistItem._id);
      }

      setWishlist(prev => prev.filter(p => p.id !== productId));
      toast.info('Item removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
      console.error(error);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  const cartTotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

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
