import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, PawPrint, Package, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_id: string;
  order_time: string;
  payment_type: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  zip_code: string;
  subtotal: number;
  delivery_charges: number;
  total: number;
}

interface OrderItem {
  id: string;
  order_id: string;
  inventory_id: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const Profile = () => {
  const { isAuthenticated, isLoading, user, pets } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth?redirect=/profile');
    } else if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, isLoading, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders from /orders/');
      const response = await api.get('/orders/');
      console.log('Orders received:', response.data);
      setOrders(response.data || []);
    } catch (error: any) {
      console.error('Failed to load orders:', error.response?.data || error.message);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (order: Order) => {
    try {
      setSelectedOrder(order);
      console.log('Fetching items for order:', order.id);
      const response = await api.get(`/orders/${order.id}/items`);
      console.log('Order items received:', response.data);

      const normalizedItems: OrderItem[] = (response.data || []).map((item: any) => {
        const unit = Number(item.unit_price ?? item.price ?? 0);
        const qty = Number(item.quantity ?? 1);
        return {
          id: item.id || item._id || `${order.id}-${Math.random()}`,
          order_id: order.id,
          inventory_id: item.inventory_id,
          product_name: item.product_name || 'Product',
          product_image: item.product_image,
          quantity: qty,
          unit_price: unit,
          total_price: unit * qty,
        };
      });

      setOrderItems(normalizedItems);
      setDetailsOpen(true);
    } catch (error: any) {
      console.error('Failed to load order details:', error.response?.data || error.message);
      toast.error('Failed to load order details');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      dispatched: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return statusColors[status] || 'bg-gray-500';
  };

  const getShortOrderId = (orderId: string) => {
    if (!orderId) return 'N/A';
    return orderId.slice(-3).toUpperCase();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (oldPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);

    try {
      console.log('Sending change password request...');
      const response = await api.post('/users/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });

      console.log('Change password response:', response.data);
      toast.success('Password changed successfully');
      setChangePasswordOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorDetail = error.response?.data?.detail || error.message || 'Failed to change password';
      console.error('Error detail:', errorDetail);
      toast.error(errorDetail);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
          My <span className="text-primary">Profile</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl shadow-soft border border-border p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/20">
                  <User className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                {user?.name}
              </h2>
              <p className="text-muted-foreground mb-6">{user?.email}</p>

              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <PawPrint className="h-5 w-5 text-primary" />
                <span>{pets.length} Pet{pets.length !== 1 ? 's' : ''} registered</span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details Form */}
            <div className="bg-card rounded-3xl shadow-soft border border-border p-8">
              <h2 className="text-xl font-display font-bold text-foreground mb-6">
                Account Details
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="displayName"
                      defaultValue={user?.name}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => setChangePasswordOpen(true)}
                  variant="outline"
                  className="mt-4 gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card rounded-3xl shadow-soft border border-border p-8">
              <h2 className="text-xl font-display font-bold text-foreground mb-6">
                Quick Actions
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/my-pets">
                  <div className="p-4 rounded-xl bg-muted hover:bg-primary/10 transition-colors cursor-pointer">
                    <PawPrint className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold">Manage Pets</h3>
                    <p className="text-sm text-muted-foreground">
                      Add or edit your pet profiles
                    </p>
                  </div>
                </Link>
                <Link to="/wishlist">
                  <div className="p-4 rounded-xl bg-muted hover:bg-primary/10 transition-colors cursor-pointer">
                    <svg
                      className="h-8 w-8 text-primary mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <h3 className="font-semibold">Wishlist</h3>
                    <p className="text-sm text-muted-foreground">
                      View your saved items
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* My Orders */}
            <div className="bg-card rounded-3xl shadow-soft border border-border p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  My Orders
                </h2>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-semibold text-sm">Order ID</th>
                        <th className="text-right py-3 px-2 font-semibold text-sm">Price</th>
                        <th className="text-center py-3 px-2 font-semibold text-sm">Status</th>
                        <th className="text-center py-3 px-2 font-semibold text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr key={order.id || index} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-2">
                            <span className="font-mono font-semibold">#{getShortOrderId(order.id)}</span>
                          </td>
                          <td className="py-4 px-2 text-right font-semibold">
                            Rs {order.total.toFixed(2)}
                          </td>
                          <td className="py-4 px-2 text-center">
                            <Badge className={`${getStatusBadge(order.status)} text-white`}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewOrderDetails(order)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">
              Order Details #{selectedOrder && getShortOrderId(selectedOrder.id)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`${getStatusBadge(selectedOrder.status)} text-white mt-1`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.order_time).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="p-4 bg-muted rounded-lg space-y-1">
                  <p className="font-medium">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.address}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.city}, {selectedOrder.zip_code}</p>
                  {selectedOrder.phone && (
                    <p className="text-sm text-muted-foreground">Phone: {selectedOrder.phone}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      {item.product_image && (
                        <img 
                          src={item.product_image} 
                          alt={item.product_name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name || 'Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × Rs {Number(item.unit_price || 0).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        Rs {Number(item.total_price || 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Charges</span>
                    <span>Rs {selectedOrder.delivery_charges.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                    <span>Total</span>
                    <span className="text-primary">Rs {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setChangePasswordOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>    </div>
  );
};

export default Profile;