import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Features from './pages/Features';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import Dashboard from './pages/Dashboard';
import Product from './pages/Product';
import Cart from './pages/Cart';
import PaymentResult from './pages/PaymentResult';
import Orders from './pages/Orders';
import RequireAuth from './components/RequireAuth';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import RequireAdmin from './components/admin/RequireAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/features" element={<Features />} />
                <Route path="/about" element={<About />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/orders"
                  element={
                    <RequireAuth>
                      <Orders />
                    </RequireAuth>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/payment-result" element={<PaymentResult />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
