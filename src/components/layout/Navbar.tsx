import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  PawPrint,
  Search,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, wishlist } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <PawPrint className="h-8 w-8 text-primary transition-transform group-hover:scale-110 group-hover:rotate-12" />
            </div>
            <span className="text-xl md:text-2xl font-display font-bold text-foreground">
              Paw<span className="text-primary">Store</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-foreground/80 hover:text-primary font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/my-pets"
                className="text-foreground/80 hover:text-primary font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                My Pets
              </Link>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {wishlist.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-pets')}>
                    <PawPrint className="mr-2 h-4 w-4" />
                    My Pets
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="hidden md:flex">
                  Login
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/my-pets"
                  className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Pets
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  to="/auth"
                  className="px-4 py-2 text-primary font-medium hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
