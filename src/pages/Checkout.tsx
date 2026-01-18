import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Check, Banknote, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  // Populate user email when user loads
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  // Redirect to login if not authenticated - MUST be before any checkout
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please login to proceed with checkout');
      navigate(`/auth?redirect=/checkout`);
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  // If items is empty after authenticated, redirect to cart
  useEffect(() => {
    if (!isLoading && isAuthenticated && items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, isAuthenticated, isLoading, navigate]);

  // Sync cart to backend when user is authenticated and has items
  useEffect(() => {
    const syncCartToBackend = async () => {
      if (isAuthenticated && items.length > 0) {
        try {
          console.log('Syncing cart to backend on checkout load:', items);
          
          // Add delay to ensure previous operations complete
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Clear backend cart first
          try {
            await api.delete('/cart/clear');
            console.log('Backend cart cleared');
          } catch (error) {
            console.log('Cart clear (may not exist yet):', error);
          }
          
          // Add delay to ensure clear completes
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Sync each item to backend
          for (const item of items) {
            console.log(`Syncing item: ${item.product.name} (ID: ${item.product.id}), Quantity: ${item.quantity}`);
            try {
              const response = await api.post('/cart/items', {
                inventory_id: item.product.id,
                quantity: item.quantity
              });
              console.log('Item synced response:', response.data);
            } catch (error: any) {
              console.error(`Failed to sync item ${item.product.name}:`, error.response?.data || error.message);
              throw error;
            }
          }
          
          console.log('Cart synced successfully to backend');
        } catch (error: any) {
          console.error('Failed to sync cart to backend:', error.response?.data || error.message);
        }
      }
    };

    syncCartToBackend();
  }, [isAuthenticated]); // Only sync once when authenticated

  // Delivery charges: Rs 300 if total < 2000, free if >= 2000
  const deliveryCharges = cartTotal < 2000 ? 300 : 0;
  const total = cartTotal + deliveryCharges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate cart has items
      if (items.length === 0) {
        toast.error('Your cart is empty. Please add items before checkout.');
        setIsProcessing(false);
        return;
      }

      console.log('Creating order with cart items already synced to backend');

      // Small delay to ensure backend cart sync is fully processed
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create order in backend (cart is already synced on page load)
      const orderResponse = await api.post('/orders/', {
        payment_type: 'cod',
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip_code: formData.zip
      });

      // Clear frontend cart
      clearCart();
      
      // Clear backend cart as well
      try {
        await api.delete('/cart/clear');
      } catch (error) {
        console.log('Backend cart clear:', error);
      }

      toast.success('Order placed successfully!');
      navigate(`/`);
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.error(error.response?.data?.detail || error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading spinner during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading or empty state when no items
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
          <span className="text-primary">Checkout</span>
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 2 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 transition-colors ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Shipping */}
              {step === 1 && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-display font-bold">Shipping Information</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        required 
                        className="mt-1" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        required 
                        className="mt-1" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        required 
                        className="mt-1" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        className="mt-1"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="e.g. 03xxxxxxxxx"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        required 
                        className="mt-1" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        required 
                        className="mt-1" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input 
                        id="zip" 
                        required 
                        className="mt-1" 
                        value={formData.zip}
                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="hero"
                    className="w-full mt-6"
                    onClick={() => setStep(2)}
                  >
                    Continue to Review Order
                  </Button>
                </div>
              )}

              {/* Step 2: Review & Payment */}
              {step === 2 && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <Banknote className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-display font-bold">Review Your Order & Payment Method</h2>
                  </div>
                  
                  {/* Order Items */}
                  <div className="space-y-4 mb-8 pb-8 border-b border-border">
                    <h3 className="font-semibold text-foreground">Order Items</h3>
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4">
                        <img
                          src={item.product.image || 'https://via.placeholder.com/100'}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold">
                          Rs. {(item.product.price * item.quantity).toLocaleString('en-US', {maximumFractionDigits: 0})}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Payment Method */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-primary/20">
                    <h3 className="font-semibold text-foreground mb-4">Payment Method</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Cash on Delivery (COD)</p>
                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border sticky top-24">
              <h2 className="text-xl font-display font-bold text-foreground mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span>Rs. {cartTotal.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charges</span>
                  <span className={deliveryCharges === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryCharges === 0 ? 'Free Shipping! 🎉' : `Rs. ${deliveryCharges}`}
                  </span>
                </div>
                {cartTotal < 2000 && (
                  <div className="text-xs text-muted-foreground italic">
                    Add Rs. {(2000 - cartTotal).toLocaleString('en-US', {maximumFractionDigits: 0})} more for free shipping
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
