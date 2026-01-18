import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, HeadphonesIcon, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroCarousel from '@/components/home/HeroCarousel';
import CategoryCard from '@/components/home/CategoryCard';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';
import { productService } from '@/services/product.service';
import { useAuth } from '@/context/AuthContext';

interface Category {
  _id?: string;
  id?: string;
  name: string;
  image_url?: string;
  coming_soon?: boolean;
  productCount?: number;
}

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over Rs. 2000',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure checkout',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Dedicated support team',
  },
  {
    icon: Gift,
    title: 'Gift Cards',
    description: 'Perfect pet lover gift',
  },
];

const Index = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadCategories(), loadFeaturedProducts()]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await productService.getCategories();
      const inventoryData = await productService.getInventory();
      
      // Count products for each category
      const categoriesWithCounts = categoriesData.map(cat => {
        const productCount = inventoryData.filter(
          item => item.category_id === cat._id && item.is_visible
        ).length;
        return {
          ...cat,
          productCount
        };
      });
      
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const [inventoryData, categoriesData] = await Promise.all([
        productService.getInventory(),
        productService.getCategories(),
      ]);

      const productsList: Product[] = inventoryData
        .filter(item => item.is_visible)
        .map(item => {
          const category = categoriesData.find(c => c._id === item.category_id);
          
          // Debug logging
          console.log('Index - Processing item:', item.name);
          console.log('Index - Item images:', item.images);
          console.log('Index - First image:', item.images?.[0]);
          
          return productService.convertToProduct(
            item,
            category?.name || 'General',
            item.subcategory || 'accessories'
          );
        })
        .slice(0, 8); // Get first 8 products as featured

      setFeaturedProducts(productsList);
    } catch (error) {
      console.error('Failed to load featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-6 md:py-10">
        <HeroCarousel />
      </section>

      {/* Features */}
      <section className="bg-cream py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Shop by <span className="text-primary">Pet</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Find everything your furry, feathery, or finned friend needs
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <CategoryCard 
              key={cat._id || cat.id} 
              category={cat.name}
              image={cat.image_url || 'https://via.placeholder.com/600x600?text=' + cat.name}
              productCount={cat.productCount || 0}
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-cream py-12 md:py-16 paw-pattern">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Featured <span className="text-primary">Products</span>
              </h2>
              <p className="text-muted-foreground">
                Our most popular items loved by pets everywhere
              </p>
            </div>
            <Link to="/store">
              <Button variant="outline" className="hidden md:flex">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/store">
              <Button variant="default">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show when not logged in */}
      {!user && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 paw-pattern opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Join Our Pet Family!
              </h2>
              <p className="text-primary-foreground/90 mb-6 max-w-md mx-auto">
                Create an account to save your pet profiles and get personalized recommendations.
              </p>
              <Link to="/auth">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-card text-foreground hover:bg-card/90"
                >
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
