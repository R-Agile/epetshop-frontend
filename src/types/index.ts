export type PetCategory = 'dogs' | 'cats' | 'birds' | 'fishes';
export type ProductCategory = 'accessories' | 'toys' | 'food';
export type OrderStatus = 'pending' | 'in_progress' | 'dispatched' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  petCategory: PetCategory;
  productCategory: ProductCategory;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  description?: string;
  stock?: number;
  isVisible?: boolean;
  brand?: string;
  weight?: string;
  age_range?: string;
  discount?: number;
}

export interface Pet {
  id: string;
  name: string;
  category: PetCategory;
  breed: string;
  age: string;
  image: string;
  notes?: string;
  username?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'banned';
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
   userPhone?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
}

export interface InventoryItem extends Product {
  stock: number;
  isVisible: boolean;
}
