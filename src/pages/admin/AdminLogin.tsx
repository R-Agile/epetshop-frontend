import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Lock, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/context/AdminContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin, isAdminAuthenticated, isAdminLoading } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await adminLogin(email, password);
    setIsLoading(false);
    // Navigation will be handled by useEffect when isAdminAuthenticated changes
  };

  // Show loading state while checking authentication
  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl shadow-xl mb-4 animate-pulse">
            <PawPrint className="w-10 h-10 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl shadow-xl mb-4">
            <PawPrint className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage PawStore</p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          <div className="flex items-center gap-2 mb-6 p-3 bg-primary/10 rounded-xl">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-foreground">Secure Admin Access</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pawstore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Back to Store */}
        <p className="text-center mt-6 text-muted-foreground">
          <a href="/" className="text-primary hover:underline">
            ← Back to Store
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
