import api from '@/lib/api';

export interface CartItemRequest {
  user_id: string;
  product_id: string;
  quantity: number;
}

export interface CartItemResponse {
  _id: string;
  user_id: string;
  product_id: string;
  quantity: number;
}

export interface WishlistItemRequest {
  user_id: string;
  product_id: string;
}

export interface WishlistItemResponse {
  _id: string;
  user_id: string;
  product_id: string;
}

export const cartService = {
  // Cart operations
  async getCart(userId: string): Promise<CartItemResponse[]> {
    const response = await api.get(`/cart/user/${userId}`);
    return response.data;
  },

  async addToCart(data: CartItemRequest): Promise<CartItemResponse> {
    const response = await api.post('/cart', data);
    return response.data;
  },

  async updateCartQuantity(cartId: string, quantity: number): Promise<CartItemResponse> {
    const response = await api.put(`/cart/${cartId}`, { quantity });
    return response.data;
  },

  async removeFromCart(cartId: string): Promise<void> {
    await api.delete(`/cart/${cartId}`);
  },

  async clearCart(userId: string): Promise<void> {
    const cartItems = await this.getCart(userId);
    await Promise.all(cartItems.map(item => this.removeFromCart(item._id)));
  },

  // Wishlist operations
  async getWishlist(userId: string): Promise<WishlistItemResponse[]> {
    const response = await api.get(`/wishlist/user/${userId}`);
    return response.data;
  },

  async addToWishlist(data: WishlistItemRequest): Promise<WishlistItemResponse> {
    const response = await api.post('/wishlist', data);
    return response.data;
  },

  async removeFromWishlist(wishlistId: string): Promise<void> {
    await api.delete(`/wishlist/${wishlistId}`);
  },
};
