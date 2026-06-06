import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { logout } from '../lib/api';
import { getAuthUser, getCartItems, signOut } from '../lib/store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [authUser, setAuthUser] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const navLinks = useMemo(() => [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse Designs' },
    { path: '/features', label: 'Features' },
    { path: '/dashboard', label: 'AI T-Shirt Studio' },
    { path: '/about', label: 'About Us' },
  ], []);

  useEffect(() => {
    const syncHeaderState = () => {
      setAuthUser(getAuthUser());
      setCartCount(getCartItems().reduce((sum, item) => sum + item.quantity, 0));
    };

    syncHeaderState();
    window.addEventListener('storage', syncHeaderState);
    window.addEventListener('cotee-auth-change', syncHeaderState);
    window.addEventListener('cotee-cart-change', syncHeaderState);

    return () => {
      window.removeEventListener('storage', syncHeaderState);
      window.removeEventListener('cotee-auth-change', syncHeaderState);
      window.removeEventListener('cotee-cart-change', syncHeaderState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Still clear local auth if the token is expired or the network is unavailable.
    } finally {
      signOut();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f7f5]">
      {/* Header Navigation */}
      <header className="bg-white border-b border-[rgba(255,148,41,0.1)] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-[#ffa62b] rounded-lg p-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0f172a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>CoTee</h1>
                <p className="text-xs text-[#64748b]">AI Creator Studio</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-[rgba(255,148,41,0.1)] text-[#ff9429]'
                      : 'text-[#475569] hover:bg-[#f1f5f9]'
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {authUser ? (
                <>
                  <Link
                    to="/cart"
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                      location.pathname === '/cart'
                        ? 'bg-[rgba(255,148,41,0.1)] text-[#ff9429]'
                        : 'text-[#475569] hover:bg-[#f1f5f9]'
                    }`}
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Cart ({cartCount})
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#f1f5f9] rounded-lg"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#f1f5f9] rounded-lg"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-[#ff9429] text-white text-sm font-bold rounded-lg hover:bg-[#ff8c1a] transition-colors"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-[rgba(255,148,41,0.05)] mt-16">
        <div className="max-w-[1280px] mx-auto px-8 py-12">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-[#0f172a] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>CoTee</h3>
              <p className="text-sm text-[#64748b]">AI-powered design creation platform</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#0f172a] mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li><Link to="/features" className="hover:text-[#ff9429]">Features</Link></li>
                <li><Link to="/browse" className="hover:text-[#ff9429]">Browse</Link></li>
                <li><Link to="/dashboard" className="hover:text-[#ff9429]">AI T-Shirt Studio</Link></li>
                <li><Link to="/cart" className="hover:text-[#ff9429]">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#0f172a] mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li><Link to="/about" className="hover:text-[#ff9429]">About Us</Link></li>
                <li><a href="#" className="hover:text-[#ff9429]">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#0f172a] mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li><a href="#" className="hover:text-[#ff9429]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#ff9429]">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[rgba(255,148,41,0.05)] pt-8 text-center text-sm text-[#94a3b8]">
            © 2024 CoTee AI Creator Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
