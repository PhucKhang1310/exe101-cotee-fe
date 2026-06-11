import { useEffect, useState } from 'react';
import { Banknote, Package, ShoppingBag, Users } from 'lucide-react';
import { Link } from 'react-router';
import { getProducts, type ApiProduct } from '../../lib/api';
import { getAdminOrders, getAdminUsers, type AdminOrder, type AdminUser } from '../../lib/adminApi';
import { formatVnd } from '../../lib/commerce';

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    Promise.all([getAdminUsers(), getProducts(), getAdminOrders()])
      .then(([userResponse, productResponse, orderResponse]) => {
        setUsers(userResponse.items);
        setProducts(productResponse);
        setOrders(orderResponse);
      })
      .catch((error) => setNotice(error instanceof Error ? error.message : 'Unable to load dashboard.'));
  }, []);

  const revenue = orders
    .filter((order) => order.paymentStatus === 'Paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const statistics = [
    { label: 'Total users', value: users.length.toLocaleString(), icon: Users },
    { label: 'Active products', value: products.filter((product) => product.stock > 0).length.toLocaleString(), icon: Package },
    { label: 'Total orders', value: orders.length.toLocaleString(), icon: ShoppingBag },
    { label: 'Paid revenue', value: formatVnd(revenue), icon: Banknote },
  ];

  return (
    <div className="mx-auto max-w-[1440px]">
      <p className="text-sm text-[#64748b]">Live overview from the CoTee API.</p>
      {notice && <div className="mt-5 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700">{notice}</div>}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-[#ff9429]"><Icon className="h-5 w-5" /></span>
            <p className="mt-5 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between"><div><h2 className="font-extrabold">Account health</h2><p className="text-xs text-slate-400">Current account status</p></div><Link to="/admin/users" className="text-sm font-bold text-[#ff9429]">Manage</Link></div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-green-50 p-4"><strong className="text-2xl">{users.filter((user) => user.isActive).length}</strong><p className="text-xs text-green-700">Active</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><strong className="text-2xl">{users.filter((user) => !user.isActive).length}</strong><p className="text-xs text-slate-600">Inactive</p></div>
            <div className="rounded-xl bg-blue-50 p-4"><strong className="text-2xl">{users.filter((user) => user.role === 'Admin').length}</strong><p className="text-xs text-blue-700">Admins</p></div>
          </div>
        </article>
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between"><div><h2 className="font-extrabold">Order pipeline</h2><p className="text-xs text-slate-400">Fulfillment status</p></div><Link to="/admin/orders" className="text-sm font-bold text-[#ff9429]">Manage</Link></div>
          <div className="mt-6 space-y-3">
            {['Pending', 'Processing', 'Shipping', 'Completed'].map((status) => {
              const count = orders.filter((order) => order.orderStatus === status).length;
              return <div key={status} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span>{status}</span><strong>{count}</strong></div>;
            })}
          </div>
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-5"><div><h2 className="font-extrabold">Recent orders</h2><p className="text-xs text-slate-400">Latest transactions</p></div><Link to="/admin/orders" className="text-sm font-bold text-[#ff9429]">View all</Link></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Payment</th><th className="px-5 py-4">Amount</th></tr></thead>
            <tbody>{orders.slice(0, 5).map((order) => <tr key={order.id} className="border-t"><td className="px-5 py-4 font-semibold">{order.orderCode}</td><td className="px-5 py-4">{order.shippingDetails.fullName}</td><td className="px-5 py-4">{order.orderStatus}</td><td className="px-5 py-4">{order.paymentStatus}</td><td className="px-5 py-4 font-bold">{formatVnd(order.totalAmount)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
