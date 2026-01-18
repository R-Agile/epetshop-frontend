import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const { stats, orders } = useAdmin();

  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600';
      case 'in_progress': return 'bg-blue-500/20 text-blue-600';
      case 'dispatched': return 'bg-purple-500/20 text-purple-600';
      case 'delivered': return 'bg-green-500/20 text-green-600';
      case 'cancelled': return 'bg-red-500/20 text-red-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">Rs. {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active customers
              </p>
            </CardContent>
          </Card>

          <Card className={stats.lowStockItems > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle>
              <AlertTriangle className={`w-5 h-5 ${stats.lowStockItems > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Items below 10 units
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.userName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">Rs. {order.total.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
