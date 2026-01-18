import api from '@/lib/api';
import { Product } from '@/types';

export interface InventoryItem {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  category_id: string;
  subcategory: string;
  stock: number;
  images?: string[];
  description?: string;
  rating?: number;
  num_reviews?: number;
  is_visible: boolean;
  brand?: string;
  weight?: string;
  age_range?: string;
}

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  coming_soon?: boolean;
}

export interface Subcategory {
  _id: string;
  name: string;
}

export const productService = {
  async getInventory(): Promise<InventoryItem[]> {
    const response = await api.get('/inventory/');
    return response.data;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories/');
    return response.data;
  },

  async getSubcategories(): Promise<Subcategory[]> {
    // Subcategories are now hardcoded on frontend: food, toys, accessories
    return [
      { _id: 'food', name: 'Food' },
      { _id: 'toys', name: 'Toys' },
      { _id: 'accessories', name: 'Accessories' },
    ];
  },

  async getInventoryByCategory(categoryId: string): Promise<InventoryItem[]> {
    const response = await api.get('/inventory/', { params: { category_id: categoryId } });
    return response.data;
  },

  async getInventoryBySubcategory(subcategoryName: string): Promise<InventoryItem[]> {
    const response = await api.get('/inventory/', { params: { subcategory: subcategoryName } });
    return response.data;
  },

  // Helper function to convert backend inventory to frontend Product format
  convertToProduct(item: InventoryItem, categoryName: string, subcategoryName: string): Product {
    return {
      id: item._id,
      name: item.name,
      price: item.price,
      originalPrice: item.discount && item.discount > 0 ? item.price / (1 - item.discount / 100) : undefined,
      image: item.images?.[0] || 'https://via.placeholder.com/300',
      petCategory: categoryName.toLowerCase() as any,
      productCategory: (subcategoryName || 'accessories').toLowerCase() as any,
      rating: item.rating || 4.5,
      reviewCount: item.num_reviews || 0,
      inStock: item.stock > 0 && item.is_visible,
      description: item.description,
      stock: item.stock,
      isVisible: item.is_visible,
      brand: item.brand,
      weight: item.weight,
      age_range: item.age_range,
      discount: item.discount,
    };
  },
};
