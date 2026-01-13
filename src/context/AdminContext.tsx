import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, Order, InventoryItem, OrderStatus } from '@/types';
import { toast } from 'sonner';
import api from '@/lib/api';
import { encryptData } from '@/lib/crypto';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminUser: any;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  
  // Inventory
  inventory: InventoryItem[];
  loadInventory: () => Promise<void>;
  updateStock: (productId: string, stock: number) => void;
  toggleVisibility: (productId: string) => void;
  
  // Users
  users: AdminUser[];
  updateUserStatus: (userId: string, status: 'active' | 'inactive' | 'banned') => void;
  
  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  
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
  const [adminUser, setAdminUser] = useState<any>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Check if admin is already logged in
  useEffect(() => {
    const storedAdminToken = localStorage.getItem('adminToken');
    const storedAdminUser = localStorage.getItem('adminUser');
    if (storedAdminToken && storedAdminUser) {
      setIsAdminAuthenticated(true);
      setAdminUser(JSON.parse(storedAdminUser));
    }
  }, []);

  // Load users when admin is authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      loadUsers();
      loadInventory();
    }
  }, [isAdminAuthenticated]);

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      const response = await api.get('/users/');
      console.log('Users response:', response.data);
      
      const usersData = (response.data || [])
        .filter((user: any) => user.role === 'user') // Only show regular users, not super_user
        .map((user: any) => {
          console.log(`User: ${user.full_name}, Status: ${user.status}`);
          return {
            id: user._id,
            name: user.full_name || 'Unknown',
            email: user.email || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'default'}`,
            joinDate: user.register_time,
            totalOrders: 0, // Will be calculated from orders
            totalSpent: 0, // Will be calculated from orders
            status: user.status || 'active', // Use actual status from database
          };
        });
      setUsers(usersData);
      console.log('Users loaded:', usersData.length);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load users');
      setUsers([]);
    }
  };

  const loadInventory = async () => {
    try {
      console.log('Loading inventory...');
      const response = await api.get('/inventory/');
      console.log('Inventory response:', response.data);
      
      const inventoryData = (response.data || []).map((item: any) => {
        console.log('Processing item:', item.name, item);
        return {
          id: item.id || item._id,
          name: item.name || 'Unknown',
          petCategory: item.category_id || 'general',
          productCategory: item.subcategory_id || 'general',
          price: parseFloat(item.price) || 0,
          stock: parseInt(item.stock) || 0,
          image: item.images?.[0] || 'https://via.placeholder.com/150',
          isVisible: item.is_visible !== false,
        };
      });
      setInventory(inventoryData);
      console.log('Inventory loaded:', inventoryData.length, 'items');
    } catch (error: any) {
      console.error('Failed to load inventory:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load inventory');
      setInventory([]);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('='.repeat(50));
      console.log('ADMIN LOGIN - Frontend');
      console.log('Email:', email);

      // Encrypt credentials before sending
      const dataToEncrypt = JSON.stringify({
        email: email,
        password: password,
      });
      
      const encryptedData = encryptData(dataToEncrypt);

      const response = await api.post('/users/login', {
        encrypted: encryptedData,
      });

      console.log('Login response received');
      console.log('Response data keys:', Object.keys(response.data));

      const { user, access_token } = response.data;

      // Check if user is super_user
      if (user.role !== 'super_user') {
        console.log('User role is:', user.role, '- Only super_user can access admin portal');
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

  const updateStock = (productId: string, stock: number) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, stock: Math.max(0, stock) } : item
      )
    );
    toast.success('Stock updated');
  };

  const toggleVisibility = (productId: string) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, isVisible: !item.isVisible } : item
      )
    );
    toast.success('Visibility updated');
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'banned') => {
    try {
      console.log(`Updating user ${userId} status to ${status}`);
      
      // Send to backend
      await api.put(`/users/${userId}`, { status });
      
      console.log(`User status updated successfully`);
      
      // Reload users to get fresh data from database
      await loadUsers();
      
      toast.success(`User status updated to ${status}`);
      
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update user status';
      toast.error(errorMessage);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId 
          ? { ...order, status, updatedAt: new Date().toISOString() } 
          : order
      )
    );
    toast.success('Order status updated');
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
