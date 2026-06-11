import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  ShoppingCart,
  Shirt,
  Users,
  X,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import { logout } from '../../lib/api';
import { getAuthClaims } from '../../lib/auth';
import { signOut } from '../../lib/store';

const primaryNavigation = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/admin/users', label: 'User Management', icon: Users, exact: false },
  { path: '/admin/products', label: 'Products', icon: Palette, exact: false },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart, exact: false },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/products': 'Product Management',
  '/admin/orders': 'Order Management',
};

export default function AdminLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const claims = getAuthClaims();

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const renderLink = (item: (typeof primaryNavigation)[number]) => {
    const Icon = item.icon;
    const active = isActive(item.path, item.exact);

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
          active
            ? 'bg-[#ff9429] text-white shadow-sm shadow-orange-200'
            : 'text-[#64748b] hover:bg-[#fff7ed] hover:text-[#ff9429]'
        }`}
      >
        <Icon className="h-5 w-5" />
        {item.label}
      </Link>
    );
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try { await logout(); } catch { /* Clear local auth even if the API is unavailable. */ }
    finally { signOut(); window.location.assign('/login'); }
  };

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isProfileOpen) return;

    const closeProfileMenu = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('pointerdown', closeProfileMenu);
    return () => window.removeEventListener('pointerdown', closeProfileMenu);
  }, [isProfileOpen]);

  return (
    <div
      className="min-h-screen bg-[#f8f7f5] text-[#0f172a]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-[#f1f5f9] bg-white transition-transform lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#f8f7f5] px-5">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ff9429] text-white">
              <Shirt className="h-6 w-6" />
            </span>
            <span>
              <strong className="block text-lg font-extrabold">CoTee Admin</strong>
              <span className="block text-xs text-[#94a3b8]">Platform Hub</span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-[#64748b] hover:bg-[#f8f7f5] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">{primaryNavigation.map(renderLink)}</div>
        </nav>

        <div className="m-4 rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#ff9429]">System Health</span>
            <span className="text-[#16a34a]">98%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ffedd5]">
            <div className="h-full w-[92%] rounded-full bg-[#ff9429]" />
          </div>
          <p className="mt-3 text-[11px] text-[#94a3b8]">All services operational</p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[272px]">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-[#f1f5f9] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-[#475569] hover:bg-[#f8f7f5] lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-extrabold">{pageTitles[location.pathname] ?? 'Admin'}</h1>
          </div>

          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className={`flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors ${
                isProfileOpen ? 'bg-[#fff7ed]' : 'hover:bg-[#f8f7f5]'
              }`}
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
            >
              <span className="hidden max-w-48 sm:block">
                <strong className="block truncate text-sm">
                  {claims?.name || claims?.email || 'Administrator'}
                </strong>
                <span className="block text-[11px] font-semibold text-[#ff9429]">Administrator</span>
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#315b5a] text-sm font-bold text-white shadow-sm">
                {(claims?.name || claims?.email || 'A').slice(0, 2).toUpperCase()}
              </span>
              <ChevronDown
                className={`hidden h-4 w-4 text-[#94a3b8] transition-transform sm:block ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl shadow-slate-200/70"
              >
                <div className="border-b border-[#f1f5f9] bg-[#fffaf5] px-4 py-4">
                  <p className="truncate text-sm font-extrabold">
                    {claims?.name || 'Administrator'}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#64748b]">
                    {claims?.email || 'Admin account'}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#dc2626] transition-colors hover:bg-[#fef2f2] disabled:cursor-wait disabled:opacity-60"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fee2e2]">
                      <LogOut className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block">{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
                      <span className="block text-left text-[11px] font-normal text-[#94a3b8]">
                        End this admin session
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
