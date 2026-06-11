import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cancelOrder, getAdminOrders, updateOrderStatus, type AdminOrder } from '../../lib/adminApi';
import { formatVnd } from '../../lib/commerce';

const orderStatuses = ['Pending', 'Processing', 'Shipping', 'Completed', 'Cancelled'];
const paymentStatuses = ['Pending', 'Paid', 'Failed'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setOrders(await getAdminOrders()); setNotice(''); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to load orders.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) =>
      !term ||
      order.orderCode.toLowerCase().includes(term) ||
      order.shippingDetails.fullName.toLowerCase().includes(term) ||
      order.shippingDetails.phone.includes(term),
    );
  }, [orders, search]);

  const update = async (order: AdminOrder, field: 'orderStatus' | 'paymentStatus', value: string) => {
    try {
      const updated = await updateOrderStatus(order.orderCode, { [field]: value });
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to update order.'); }
  };

  const cancel = async (order: AdminOrder) => {
    if (!window.confirm(`Cancel order ${order.orderCode}?`)) return;
    try {
      const updated = await cancelOrder(order.orderCode);
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to cancel order.'); }
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <div><h2 className="text-3xl font-extrabold">Order Management</h2><p className="mt-2 text-sm text-[#64748b]">Track payment and fulfillment status.</p></div>
      {notice && <div className="mt-5 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700">{notice}</div>}
      <label className="mt-6 flex max-w-xl items-center gap-3 rounded-xl border bg-white px-4 py-3"><Search className="h-5 w-5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, customer, or phone" className="flex-1 outline-none" /></label>
      <section className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Items</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Payment</th><th className="px-5 py-4">Fulfillment</th><th className="px-5 py-4">Action</th></tr></thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="border-t align-top">
                  <td className="px-5 py-4"><strong>{order.orderCode}</strong><div className="mt-1 text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</div></td>
                  <td className="px-5 py-4"><strong>{order.shippingDetails.fullName}</strong><div className="text-xs text-slate-500">{order.shippingDetails.phone}</div><div className="max-w-56 text-xs text-slate-400">{order.shippingDetails.address}</div></td>
                  <td className="px-5 py-4 text-xs">{order.items.map((item) => <div key={`${item.productId}-${item.size}`}>{item.name} x{item.quantity} ({item.size})</div>)}</td>
                  <td className="px-5 py-4 font-bold">{formatVnd(order.totalAmount)}</td>
                  <td className="px-5 py-4"><select value={order.paymentStatus} onChange={(e) => void update(order, 'paymentStatus', e.target.value)} className="rounded-lg border px-3 py-2">{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                  <td className="px-5 py-4"><select value={order.orderStatus} onChange={(e) => void update(order, 'orderStatus', e.target.value)} className="rounded-lg border px-3 py-2">{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                  <td className="px-5 py-4"><button disabled={order.paymentStatus === 'Paid' || order.orderStatus === 'Cancelled'} onClick={() => void cancel(order)} className="rounded-lg border px-3 py-2 text-red-600 disabled:opacity-40">Cancel</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t px-5 py-4 text-sm text-slate-500">{loading ? 'Loading orders...' : `${visible.length} orders`}</div>
      </section>
    </div>
  );
}
