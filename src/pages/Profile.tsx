import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Camera, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
  const { isAuthenticated, user, pets } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/profile');
    }
  }, [isAuthenticated, navigate]);

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
              <div className="relative inline-block mb-4">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-soft hover:bg-paw-orange-dark transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
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
                <Button variant="default" className="mt-4">
                  Save Changes
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
