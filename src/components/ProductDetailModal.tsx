import { useState } from 'react';
import { X, ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductDetailModal = ({ 
  product, 
  open, 
  onOpenChange 
}: ProductDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const inWishlist = product && isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onOpenChange(false);
  };

  const handleAddToWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {/* Image Section */}
          <div className="flex items-center justify-center bg-muted rounded-lg p-4">
            <img
              src={product.image || 'https://via.placeholder.com/400'}
              alt={product.name}
              className="w-full h-96 object-contain"
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">{product.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {product.brand && `Brand: ${product.brand}`}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-orange-400 text-orange-400"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                4.5 (0 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="border-t border-b py-4">
              <div className="text-3xl font-bold text-primary">
                Rs. {product.price?.toLocaleString()}
              </div>
              {product.discount && (
                <p className="text-sm text-green-600">
                  Save {product.discount}%
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
              {product.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold">{product.weight}</p>
                </div>
              )}
              {product.age_range && (
                <div>
                  <p className="text-sm text-muted-foreground">Age Range</p>
                  <p className="font-semibold">{product.age_range}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Stock</p>
                <p className="font-semibold">
                  {product.stock > 0 ? (
                    <span className="text-green-600">{product.stock} Available</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quantity & Action Buttons */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-muted"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleAddToWishlist}
                  variant={inWishlist ? "default" : "outline"}
                  className={inWishlist ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                >
                  <Heart className={`w-4 h-4 mr-2 ${inWishlist ? 'fill-current' : ''}`} />
                  {inWishlist ? 'In Wishlist' : 'Wishlist'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
