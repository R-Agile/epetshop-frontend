import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { useCart } from '@/context/CartContext';

const Wishlist = () => {
  const { wishlist } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">
            Your Wishlist is Empty
          </h1>
          <p className="text-muted-foreground mb-6">
            Save items you love by clicking the heart icon on products.
          </p>
          <Link to="/store">
            <Button variant="default" size="lg">
              Explore Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
          My <span className="text-primary">Wishlist</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="cursor-pointer"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <ProductDetailModal
          product={selectedProduct}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
        />
      </div>
    </div>
  );
};

export default Wishlist;
