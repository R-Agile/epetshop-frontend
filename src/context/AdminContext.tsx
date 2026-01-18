import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, Order, InventoryItem, OrderStatus } from '@/types';
import { toast } from 'sonner';
import api from '@/lib/api';
import { encryptData } from '@/lib/crypto';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
  adminUser: any;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  
  // Inventory
  inventory: InventoryItem[];
  loadInventory: () => Promise<void>;
  updateStock: (productId: string, stock: number) => Promise<void>;
  toggleVisibility: (productId: string) => Promise<void>;
  
  // Users
  users: AdminUser[];
  updateUserStatus: (userId: string, status: 'active' | 'inactive' | 'banned') => Promise<void>;
  
  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  
  // Stats
  stats: {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalUsers: number;
    lowStockItems: number;
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Check if admin is already logged in and validate session
  useEffect(() => {
    const initializeAdmin = async () => {
      setIsAdminLoading(true);
      const storedAdminToken = localStorage.getItem('adminToken');
      const storedAdminUser = localStorage.getItem('adminUser');
      
      if (storedAdminToken && storedAdminUser) {
        try {
          // Try to validate token by fetching users (admin endpoint)
          const response = await api.get('/users/');
          if (response.status === 200) {
            // Token is valid
            setIsAdminAuthenticated(true);
            setAdminUser(JSON.parse(storedAdminUser));
            console.log('Admin session validated successfully');
          }
        } catch (error: any) {
          // Token is invalid or expired
          console.error('Admin session validation failed:', error.response?.status);
          if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setIsAdminAuthenticated(false);
            setAdminUser(null);
            toast.error('Admin session expired. Please login again.');
          }
        }
      }
      setIsAdminLoading(false);
    };

    initializeAdmin();
  }, []);

  // Load users when admin is authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      loadUsers();
      loadInventory();
      loadOrders();
    }
  }, [isAdminAuthenticated]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users/');
      
      const usersData = (response.data || [])
        .filter((user: any) => user.role === 'user')
        .map((user: any) => ({
          id: user._id,
          name: user.full_name || 'Unknown',
          email: user.email || '',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'default'}`,
          joinDate: user.register_time,
          totalOrders: 0,
          totalSpent: 0,
          status: user.status || 'active',
        }));
      setUsers(usersData);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await api.get('/inventory/');
      
      console.log('AdminContext - Raw inventory response:', response.data);
      
      const inventoryData = (response.data || []).map((item: any) => {
        console.log('AdminContext - Item:', item.name, 'Images:', item.images);
        return {
          id: item._id,
          name: item.name || 'Unknown',
          petCategory: item.category_id || 'general',
          productCategory: item.subcategory || 'accessories',
          price: parseFloat(item.price) || 0,
          stock: parseInt(item.stock) || 0,
          image: item.images?.[0] || 'https://via.placeholder.com/150',
          isVisible: item.is_visible !== false,
          description: item.description,
          brand: item.brand,
          weight: item.weight,
          age_range: item.age_range,
        };
      });
      setInventory(inventoryData);
    } catch (error: any) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
      setInventory([]);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders/all');
      
      const ordersData = await Promise.all(
        (response.data || []).map(async (order: any) => {
          let items: any[] = [];
          
          // Use id field (backend returns id instead of _id now)
          const orderId = order.id || order._id;
          
          // Load order items
          try {
            const itemsResponse = await api.get(`/orders/${orderId}/items`);
            items = (itemsResponse.data || []).map((item: any) => ({
              product: {
                id: item.inventory_id,
                name: item.product_name || 'Product',
                price: item.price,
                image: item.product_image || 'https://via.placeholder.com/100',
              },
              quantity: item.quantity,
              price: item.price,
            }));
          } catch (error) {
            console.error(`Failed to load items for order ${orderId}:`, error);
          }
          
          return {
            id: orderId,
            userId: order.user_id,
            userName: `${order.first_name} ${order.last_name}`,
            userEmail: order.email,
            userPhone: order.phone,
            items: items,
            total: order.total || 0,
            status: order.status || 'pending',
            createdAt: order.order_time,
            updatedAt: order.order_time,
            shippingAddress: `${order.address}, ${order.city} ${order.zip_code}`,
          };
        })
      );
      
      setOrders(ordersData);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Encrypt credentials before sending
      const dataToEncrypt = JSON.stringify({
        email: email,
        password: password,
      });
      
      const encryptedData = encryptData(dataToEncrypt);

      const response = await api.post('/users/login', {
        encrypted: encryptedData,
      });

      const { user, access_token } = response.data;

      // Check if user is super_user
      if (user.role !== 'super_user') {
        toast.error(`Access Denied: Your account (${user.role}) does not have admin privileges. Please contact system administrator.`);
        return false;
      }

      localStorage.setItem('adminToken', access_token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      setAdminUser(user);
      setIsAdminAuthenticated(true);
      toast.success('Welcome Admin!');
      return true;
    } catch (error: any) {
      console.error('Admin login error:', error);
      const errorMsg = error.response?.data?.detail || 'Invalid email or password';
      toast.error(errorMsg);
      return false;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    toast.info('Admin logged out');
  };

  const updateStock = async (productId: string, stock: number) => {
    try {
      // Optimistically update UI
      setInventory(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, stock: Math.max(0, stock) } : item
        )
      );

      // Send to backend
      const newStock = Math.max(0, stock);
      await api.put(`/inventory/${productId}`, { stock: newStock });
      
      toast.success('Stock updated successfully');
      
    } catch (error: any) {
      console.error('Error updating stock:', error);
      // Reload inventory if update fails
      await loadInventory();
      toast.error(error.response?.data?.detail || 'Failed to update stock');
    }
  };

  const toggleVisibility = async (productId: string) => {
    try {
      // Find current visibility status
      const item = inventory.find(i => i.id === productId);
      const newVisibility = !item?.isVisible;
      
      // Optimistically update UI
      setInventory(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, isVisible: newVisibility } : item
        )
      );

      // Send to backend
      await api.put(`/inventory/${productId}`, { is_visible: newVisibility });
      
      toast.success('Visibility updated successfully');
      
    } catch (error: any) {
      console.error('Error updating visibility:', error);
      // Reload inventory if update fails
      await loadInventory();
      toast.error(error.response?.data?.detail || 'Failed to update visibility');
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'banned') => {
    try {
      // Send to backend
      await api.put(`/users/${userId}`, { status });
      
      // Reload users to get fresh data from database
      await loadUsers();
      
      toast.success(`User status updated to ${status}`);
      
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update user status';
      toast.error(errorMessage);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // Send to backend
      await api.put(`/orders/${orderId}`, { status });
      
      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId 
            ? { ...order, status, updatedAt: new Date().toISOString() } 
            : order
        )
      );
      
      toast.success('Order status updated');
      
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update order status';
      toast.error(errorMessage);
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length,
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
    totalUsers: users.length,
    lowStockItems: inventory.filter(i => i.stock < 10).length,
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        isAdminLoading,
        adminUser,
        adminLogin,
        adminLogout,
        inventory,
        loadInventory,
        updateStock,
        toggleVisibility,
        users,
        updateUserStatus,
        orders,
        updateOrderStatus,
        stats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
