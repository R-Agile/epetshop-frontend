import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// User pages
import Index from "@/pages/Index";
import Store from "@/pages/Store";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import Checkout from "@/pages/Checkout";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import MyPets from "@/pages/MyPets";
import Profile from "@/pages/Profile";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";

// Admin pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminOrders from "@/pages/admin/AdminOrders";

const AdminProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAdminAuthenticated, isAdminLoading } = useAdmin();
  
  // Show loading spinner while checking authentication
  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{element}</>;
};

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute element={<AdminDashboard />} />} />
        <Route path="/admin/inventory" element={<AdminProtectedRoute element={<AdminInventory />} />} />
        <Route path="/admin/users" element={<AdminProtectedRoute element={<AdminUsers />} />} />
        <Route path="/admin/orders" element={<AdminProtectedRoute element={<AdminOrders />} />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/store" element={<Store />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/my-pets" element={<MyPets />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes;
