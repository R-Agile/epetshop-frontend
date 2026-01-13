import { Link } from 'react-router-dom';
import { PawPrint, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-soft-brown text-cream pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <PawPrint className="h-8 w-8 text-primary" />
              <span className="text-2xl font-display font-bold">
                Paw<span className="text-primary">Store</span>
              </span>
            </Link>
            <p className="text-cream/70 mb-4">
              Your one-stop shop for all pet needs. Quality products for dogs, cats, birds, and fishes.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/store" className="text-cream/70 hover:text-primary transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/store?pet=dogs" className="text-cream/70 hover:text-primary transition-colors">
                  Dog Products
                </Link>
              </li>
              <li>
                <Link to="/store?pet=cats" className="text-cream/70 hover:text-primary transition-colors">
                  Cat Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cream/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-cream/70">
                <MapPin className="h-4 w-4 text-primary" />
                Riphah International University, Lahore
              </li>
              <li className="flex items-center gap-2 text-cream/70">
                <Phone className="h-4 w-4 text-primary" />
                +92 300 1234567
              </li>
              <li className="flex items-center gap-2 text-cream/70">
                <Mail className="h-4 w-4 text-primary" />
                support@pawstore.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/20 pt-8 text-center text-cream/50">
          <p>&copy; 2024 PawStore. All rights reserved. Made with ❤️ for pets.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
