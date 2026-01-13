import api from '@/lib/api';
import { Product } from '@/types';

export interface InventoryItem {
  _id: string;
  product_name: string;
  price: number;
  discount_percentage?: number;
  category_id: string;
  subcategory_id: string;
  stock: number;
  image_url?: string;
  description?: string;
  rating?: number;
  review_count?: number;
  is_visible: boolean;
}

export interface Category {
  _id: string;
  pet_type: string;
}

export interface Subcategory {
  _id: string;
  subcategory_name: string;
  pet_id: string;
}

export const productService = {
  async getInventory(): Promise<InventoryItem[]> {
    const response = await api.get('/inventory');
    return response.data;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/pets');
    return response.data;
  },

  async getSubcategories(): Promise<Subcategory[]> {
    const response = await api.get('/subcategories');
    return response.data;
  },

  async getInventoryByCategory(categoryId: string): Promise<InventoryItem[]> {
    const response = await api.get(`/inventory/category/${categoryId}`);
    return response.data;
  },

  async getInventoryBySubcategory(subcategoryId: string): Promise<InventoryItem[]> {
    const response = await api.get(`/inventory/subcategory/${subcategoryId}`);
    return response.data;
  },

  // Helper function to convert backend inventory to frontend Product format
  convertToProduct(item: InventoryItem, categoryName: string, subcategoryName: string): Product {
    return {
      id: item._id,
      name: item.product_name,
      price: item.price * (1 - (item.discount_percentage || 0) / 100),
      originalPrice: item.discount_percentage ? item.price : undefined,
      image: item.image_url || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
      petCategory: categoryName.toLowerCase() as any,
      productCategory: subcategoryName.toLowerCase() as any,
      rating: item.rating || 4.5,
      reviewCount: item.review_count || 0,
      inStock: item.stock > 0 && item.is_visible,
      description: item.description,
      stock: item.stock,
      isVisible: item.is_visible,
    };
  },
};
