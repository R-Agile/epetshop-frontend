import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/users/forgot-password', { email });
      setSubmitted(true);
      toast.success('Check your email for password reset instructions');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        {!submitted ? (
          <>
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
                <Mail className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground">Forgot Password?</h1>
              <p className="text-muted-foreground mt-2">
                No worries, we'll send you reset instructions
              </p>
            </div>

            {/* Form */}
            <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <>
            {/* Success Message */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl shadow-lg mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Check Your Email</h2>
              <p className="text-muted-foreground mb-6">
                We've sent password reset instructions to {email}
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full" size="lg">
                Back to Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
