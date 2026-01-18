import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      toast.error('Invalid reset link');
      navigate('/auth');
    }
  }, [email, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/users/reset-password', {
        email,
        token,
        new_password: newPassword,
      });

      toast.success('Password reset successfully!');
      setResetSuccess(true);
      setTimeout(() => navigate('/auth'), 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to reset password';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Password Reset Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Your password has been reset. Redirecting to login...
          </p>
          <Button onClick={() => navigate('/auth')} className="w-full" size="lg">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground mt-2">Enter your new password below</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {!email || !token ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold">Invalid Reset Link</p>
                <p className="text-red-700 text-sm mt-1">
                  The password reset link is missing or invalid. Please try again.
                </p>
                <Button 
                  onClick={() => navigate('/forgot-password')}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Request New Link
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </div>

        {/* Back to Login */}
        <p className="text-center mt-6 text-muted-foreground">
          <button
            onClick={() => navigate('/auth')}
            className="text-primary hover:underline font-semibold"
          >
            ← Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
