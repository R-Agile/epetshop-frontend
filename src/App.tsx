import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import AppRoutes from "@/routes/AppRoutes";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <CartProvider user={user}>
      <AdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </CartProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
