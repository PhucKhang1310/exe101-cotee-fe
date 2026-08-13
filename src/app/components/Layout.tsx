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
    <div className="min-h-screen w-full bg-[#f3faff]">
      {/* Header Navigation */}
      <header className="bg-white border-b border-[rgba(49,95,174,0.12)] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <span className="h-12 w-28 overflow-hidden rounded-lg border border-[#c9deef] bg-[#eaf7ff] shadow-sm">
                <img src="/cotee-logo.jpg" alt="CoTee" className="h-full w-full object-cover object-center" />
              </span>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#102a56]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>CoTee</h1>
                <p className="text-xs text-[#5a7899]">AI Creator Studio</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="order-3 flex w-full max-w-full items-center gap-1 overflow-x-auto pb-1 md:order-none md:w-auto md:overflow-visible md:pb-0">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-[rgba(49,95,174,0.12)] text-[#315fae]'
                      : 'text-[#486f95] hover:bg-[#e4f3fc]'
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {authUser ? (
                <>
                  <Link
                    to="/orders"
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                      location.pathname === '/orders'
                        ? 'bg-[rgba(49,95,174,0.12)] text-[#315fae]'
                        : 'text-[#486f95] hover:bg-[#e4f3fc]'
                    }`}
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/cart"
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                      location.pathname === '/cart'
                        ? 'bg-[rgba(49,95,174,0.12)] text-[#315fae]'
                        : 'text-[#486f95] hover:bg-[#e4f3fc]'
                    }`}
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Cart ({cartCount})
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-[#486f95] hover:bg-[#e4f3fc] rounded-lg"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-[#486f95] hover:bg-[#e4f3fc] rounded-lg"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-[#315fae] text-white text-sm font-bold rounded-lg hover:bg-[#244f92] transition-colors"
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
      <footer className="bg-white border-t border-[rgba(49,95,174,0.08)] mt-16">
        <div className="max-w-[1280px] mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="font-bold text-[#102a56] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>CoTee</h3>
              <p className="text-sm text-[#5a7899]">AI-powered design creation platform</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#102a56] mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-[#5a7899]">
                <li><Link to="/features" className="hover:text-[#315fae]">Features</Link></li>
                <li><Link to="/browse" className="hover:text-[#315fae]">Browse</Link></li>
                <li><Link to="/dashboard" className="hover:text-[#315fae]">AI T-Shirt Studio</Link></li>
                <li><Link to="/orders" className="hover:text-[#315fae]">My Orders</Link></li>
                <li><Link to="/cart" className="hover:text-[#315fae]">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#102a56] mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-[#5a7899]">
                <li><Link to="/about" className="hover:text-[#315fae]">About Us</Link></li>
                <li><a href="#" className="hover:text-[#315fae]">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#102a56] mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-[#5a7899]">
                <li><a href="#" className="hover:text-[#315fae]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#315fae]">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[rgba(49,95,174,0.08)] pt-8 text-center text-sm text-[#8ca9c5]">
            © 2024 CoTee AI Creator Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
