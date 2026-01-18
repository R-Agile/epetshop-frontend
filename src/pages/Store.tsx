import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ProductCard from '@/components/product/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { Product, PetCategory, ProductCategory } from '@/types';
import api from '@/lib/api';

const Store = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedPet = searchParams.get('pet') as PetCategory | null;
  const selectedCategory = searchParams.get('category') as ProductCategory | null;

  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, categoriesData] = await Promise.all([
        api.get('/inventory/'),
        api.get('/categories/'),
      ]);

      setCategories(categoriesData.data);

      // Convert inventory to products
      const productsList: Product[] = inventoryData.data
        .filter((item: any) => item.is_visible)
        .map((item: any) => {
          const category = categoriesData.data.find((c: any) => c._id === item.category_id);
          return {
            id: item._id,
            name: item.name,
            price: item.price,
            originalPrice: item.discount > 0 ? item.price / (1 - item.discount / 100) : undefined,
            image: item.images?.[0] || 'https://via.placeholder.com/300',
            petCategory: category?.name?.toLowerCase() || 'general',
            productCategory: item.subcategory || 'accessories',
            rating: item.rating || 4.5,
            reviewCount: item.num_reviews || 0,
            inStock: item.stock > 0,
            description: item.description,
            stock: item.stock,
            brand: item.brand,
            weight: item.weight,
            age_range: item.age_range,
            discount: item.discount,
          };
        });

      setProducts(productsList);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const petCategories = useMemo(() => {
    return categories.map(cat => {
      const catNameLower = cat.name.toLowerCase();
      let icon = '🐕'; // default
      if (catNameLower.includes('cat')) icon = '🐈';
      else if (catNameLower.includes('bird')) icon = '🐦';
      else if (catNameLower.includes('fish')) icon = '🐠';
      
      return {
        value: catNameLower as PetCategory,
        label: cat.name,
        icon: icon,
      };
    });
  }, [categories]);

  const productCategories = useMemo(() => {
    return [
      { value: 'food', label: 'Food' },
      { value: 'toys', label: 'Toys' },
      { value: 'accessories', label: 'Accessories' },
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search filter
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Pet category filter
      if (selectedPet && p.petCategory !== selectedPet) return false;
      // Product category filter
      if (selectedCategory && p.productCategory !== selectedCategory) return false;
      return true;
    });
  }, [products, selectedPet, selectedCategory, searchQuery]);

  const updateFilter = (type: 'pet' | 'category', value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(type, value);
    } else {
      newParams.delete(type);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = selectedPet || selectedCategory;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Our <span className="text-primary">Store</span>
          </h1>
          <p className="text-muted-foreground">
            Browse our complete collection of pet products
          </p>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card rounded-2xl p-6 shadow-soft border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-lg">Filters</h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Pet Categories */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-foreground">Pet Type</h3>
                <div className="space-y-2">
                  {petCategories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateFilter('pet', selectedPet === cat.value ? null : cat.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedPet === cat.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Categories */}
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Category</h3>
                <div className="space-y-2">
                  {productCategories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateFilter('category', selectedCategory === cat.value ? null : cat.value)}
                      className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button & Active Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {selectedPet && (
                    <Badge variant="secondary" className="gap-1">
                      {petCategories.find(c => c.value === selectedPet)?.icon}
                      {petCategories.find(c => c.value === selectedPet)?.label}
                      <button onClick={() => updateFilter('pet', null)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {productCategories.find(c => c.value === selectedCategory)?.label}
                      <button onClick={() => updateFilter('category', null)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              <span className="text-muted-foreground text-sm ml-auto">
                {filteredProducts.length} products
              </span>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden bg-card rounded-2xl p-4 mb-6 shadow-soft border border-border animate-slide-up">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-sm">Pet Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {petCategories.map((cat) => (
                        <Button
                          key={cat.value}
                          variant={selectedPet === cat.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateFilter('pet', selectedPet === cat.value ? null : cat.value)}
                        >
                          {cat.icon}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-sm">Category</h3>
                    <div className="flex flex-wrap gap-2">
                      {productCategories.map((cat) => (
                        <Button
                          key={cat.value}
                          variant={selectedCategory === cat.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateFilter('category', selectedCategory === cat.value ? null : cat.value)}
                        >
                          {cat.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product);
                      setDetailModalOpen(true);
                    }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">
                  No products found with the selected filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
};

export default Store;
