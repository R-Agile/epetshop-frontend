import { useState } from 'react';
import { Search, Package, Eye, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Order } from '@/types';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.userName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Package className="w-4 h-4" />;
      case 'dispatched': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600';
      case 'in_progress': return 'bg-blue-500/20 text-blue-600';
      case 'dispatched': return 'bg-purple-500/20 text-purple-600';
      case 'delivered': return 'bg-green-500/20 text-green-600';
      case 'cancelled': return 'bg-red-500/20 text-red-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const statusOptions: OrderStatus[] = ['pending', 'in_progress', 'dispatched', 'delivered', 'cancelled'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground mt-1">Track and manage customer orders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.userName}</p>
                      <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell className="text-right font-medium">
                    Rs. {order.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Select 
                        value={order.status} 
                        onValueChange={(value: OrderStatus) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className={`w-36 ${getStatusStyle(order.status)}`}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status.replace('_', ' ')}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(status)}
                                <span className="capitalize">{status.replace('_', ' ')}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details - {order.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 mt-4">
                          {/* Customer Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Customer</p>
                              <p className="font-medium">{order.userName}</p>
                              <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                              {order.userPhone && (
                                <p className="text-sm text-muted-foreground">{order.userPhone}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Shipping Address</p>
                              <p className="font-medium">{order.shippingAddress}</p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <p className="text-sm text-muted-foreground mb-3">Order Items</p>
                            <div className="space-y-3">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                  <img 
                                    src={item.product.image} 
                                    alt={item.product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                                    </p>
                                  </div>
                                  <p className="font-medium">
                                    Rs. {(item.quantity * item.price).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="flex justify-between items-center pt-4 border-t border-border">
                            <span className="text-lg font-medium">Total</span>
                            <span className="text-2xl font-bold text-primary">
                              Rs. {order.total.toLocaleString()}
                            </span>
                          </div>

                          {/* Timestamps */}
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span>Created: </span>
                              <span>{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            <div>
                              <span>Updated: </span>
                              <span>{new Date(order.updatedAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statusOptions.map((status) => (
            <div key={status} className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground capitalize">{status.replace('_', ' ')}</p>
              <p className={`text-2xl font-bold ${getStatusStyle(status).split(' ')[1]}`}>
                {orders.filter(o => o.status === status).length}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
