import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, getCartQuantity } = useCart();
  const inWishlist = isInWishlist(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  // Stock management
  const stock = product.stock ?? 0;
  const cartQuantity = getCartQuantity ? getCartQuantity(product.id) : 0;
  const isOutOfStock = stock === 0 || !product.inStock;
  const canAddMore = stock > 0 && cartQuantity < stock;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft card-hover border border-border/50">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image || 'https://via.placeholder.com/300?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/300x300/e5e5e5/666?text=No+Image';
          }}
        />
        
        {/* Out of Stock Badge - Top Left */}
        {isOutOfStock && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-semibold z-10">
            Out of Stock
          </Badge>
        )}

        {/* Discount Badge - Top Left (only show if not out of stock) */}
        {!isOutOfStock && hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
            -{discountPercent}%
          </Badge>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            inWishlist ? removeFromWishlist(product.id) : addToWishlist(product);
          }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all",
            inWishlist
              ? "bg-primary text-primary-foreground"
              : "bg-card/80 backdrop-blur-sm text-foreground hover:bg-card"
          )}
        >
          <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
        </button>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            variant="default"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              if (canAddMore) {
                addToCart(product);
              }
            }}
            disabled={!canAddMore}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isOutOfStock ? 'Out of Stock' : !canAddMore ? 'Max Quantity Reached' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.petCategory}
          </p>
          <Badge variant="secondary" className="text-xs">
            {product.productCategory}
          </Badge>
        </div>
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && !isOutOfStock && (
          <div className="mb-3">
            <Badge variant="outline" className="text-orange-600 border-orange-600 bg-orange-50 dark:bg-orange-950">
              Only {stock} left!
            </Badge>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            Rs. {product.price.toLocaleString('en-US', {maximumFractionDigits: 0})}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              Rs. {product.originalPrice!.toLocaleString('en-US', {maximumFractionDigits: 0})}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
