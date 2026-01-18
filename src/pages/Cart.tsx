import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/store">
            <Button variant="default" size="lg">
              Start Shopping
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
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
          Shopping <span className="text-primary">Cart</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const stock = item.product.stock ?? 0;
              const isOutOfStock = stock === 0 || !item.product.inStock;
              const canIncrease = item.quantity < stock;

              return (
                <div
                  key={item.product.id}
                  className="bg-card rounded-2xl p-4 md:p-6 shadow-soft border border-border flex gap-4"
                >
                  <img
                    src={item.product.image || 'https://via.placeholder.com/300'}
                    alt={item.product.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 capitalize">
                      {item.product.petCategory} • {item.product.productCategory}
                    </p>
                    
                    {/* Stock warning */}
                    {isOutOfStock && (
                      <p className="text-xs text-destructive mb-2">Out of Stock</p>
                    )}
                    {!isOutOfStock && stock <= 5 && (
                      <p className="text-xs text-orange-600 mb-2">Only {stock} left!</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={!canIncrease}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary text-lg">
                        Rs. {(item.product.price * item.quantity).toLocaleString('en-US', {maximumFractionDigits: 0})}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}

            <Button variant="ghost" onClick={clearCart} className="text-muted-foreground">
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border sticky top-24">
              <h2 className="text-xl font-display font-bold text-foreground mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{cartTotal > 2000 ? 'Free' : 'Rs. 300'}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    Rs. {(cartTotal + (cartTotal > 2000 ? 0 : 300)).toLocaleString('en-US', {maximumFractionDigits: 0})}
                  </span>
                </div>
              </div>

              {cartTotal < 2000 && (
                <p className="text-sm text-muted-foreground mb-4 bg-muted p-3 rounded-lg">
                  Add Rs. {(2000 - cartTotal).toLocaleString('en-US', {maximumFractionDigits: 0})} more for free shipping!
                </p>
              )}

              {isAuthenticated ? (
                <Link to="/checkout">
                  <Button variant="hero" size="lg" className="w-full">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth?redirect=/checkout">
                  <Button variant="hero" size="lg" className="w-full">
                    Login to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}

              <Link to="/store" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
