import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, Clock3, PackageCheck, Search, Truck, XCircle } from 'lucide-react';
import { cancelOrder, getMyOrders, type ApiOrder } from '../lib/api';
import { formatVnd } from '../lib/commerce';

const fulfillmentSteps = ['Pending', 'Processing', 'Shipping', 'Completed'];

const statusClasses: Record<string, string> = {
  Pending: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]',
  Processing: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
  Shipping: 'bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]',
  Completed: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
  Cancelled: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
  Paid: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
  Failed: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
};

function getOrderIcon(status: string) {
  if (status === 'Completed') return <PackageCheck className="h-5 w-5" />;
  if (status === 'Shipping') return <Truck className="h-5 w-5" />;
  if (status === 'Cancelled') return <XCircle className="h-5 w-5" />;
  if (status === 'Processing') return <Clock3 className="h-5 w-5" />;
  return <CheckCircle2 className="h-5 w-5" />;
}

function getStepIndex(order: ApiOrder) {
  if (order.orderStatus === 'Cancelled') return -1;
  return Math.max(0, fulfillmentSteps.indexOf(order.orderStatus));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function Orders() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingCode, setCancellingCode] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      setOrders(await getMyOrders());
      setNotice('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) =>
      order.orderCode.toLowerCase().includes(term) ||
      order.orderStatus.toLowerCase().includes(term) ||
      order.paymentStatus.toLowerCase().includes(term) ||
      order.items.some((item) => item.name.toLowerCase().includes(term)),
    );
  }, [orders, search]);

  const cancel = async (order: ApiOrder) => {
    if (!window.confirm(`Cancel order ${order.orderCode}?`)) return;

    setCancellingCode(order.orderCode);
    try {
      const updated = await cancelOrder(order.orderCode);
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`Order ${updated.orderCode} was cancelled.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to cancel this order.');
    } finally {
      setCancellingCode('');
    }
  };

  return (
    <div className="w-full py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff9429]">Client orders</p>
            <h1 className="mt-2 text-4xl font-extrabold text-[#0f172a] sm:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Track Your Orders
            </h1>
            <p className="mt-3 max-w-2xl text-[#64748b]">
              Follow payment and fulfillment updates for every CoTee order from your account.
            </p>
          </div>
          <Link to="/browse" className="inline-flex items-center justify-center rounded-xl bg-[#ff9429] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-[#ff8c1a]">
            Shop more designs
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 shadow-sm md:max-w-xl">
            <Search className="h-5 w-5 shrink-0 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order code, product, or status"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={loading}
            className="min-h-12 rounded-xl border border-[#e2e8f0] bg-white px-5 text-sm font-bold text-[#0f172a] hover:border-[#ffa62b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {notice && (
          <div className="mb-6 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#c2410c]">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-10 text-center text-[#64748b] shadow-sm">
            Loading your orders...
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#fff5eb] text-[#ff9429]">
              <PackageCheck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a]">No orders found</h2>
            <p className="mx-auto mt-3 max-w-md text-[#64748b]">
              Completed checkouts will appear here with payment and shipping status.
            </p>
            <Link to="/browse" className="mt-6 inline-flex rounded-xl bg-[#ff9429] px-6 py-3 font-bold text-white hover:bg-[#ff8c1a]">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {visibleOrders.map((order) => {
              const activeStep = getStepIndex(order);
              const canCancel = order.paymentStatus !== 'Paid' && order.orderStatus !== 'Cancelled';

              return (
                <article key={order.id} className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
                  <div className="flex flex-col gap-5 border-b border-[#e2e8f0] p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff5eb] text-[#ff9429]">
                          {getOrderIcon(order.orderStatus)}
                        </span>
                        <div className="min-w-0">
                          <h2 className="break-words text-xl font-extrabold text-[#0f172a]">{order.orderCode}</h2>
                          <p className="mt-1 text-sm text-[#64748b]">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[order.paymentStatus] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          Payment: {order.paymentStatus}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[order.orderStatus] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          Order: {order.orderStatus}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold uppercase text-[#94a3b8]">Total</p>
                        <p className="text-2xl font-extrabold text-[#0f172a]">{formatVnd(order.totalAmount)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void cancel(order)}
                        disabled={!canCancel || cancellingCode === order.orderCode}
                        className="min-h-11 rounded-xl border border-[#fecaca] px-4 text-sm font-bold text-[#b91c1c] hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {cancellingCode === order.orderCode ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div>
                      <div className="mb-5 grid grid-cols-4 gap-2">
                        {fulfillmentSteps.map((step, index) => {
                          const isActive = activeStep >= index;
                          return (
                            <div key={step} className="min-w-0">
                              <div className={`h-2 rounded-full ${isActive ? 'bg-[#ff9429]' : 'bg-[#e2e8f0]'}`} />
                              <p className={`mt-2 truncate text-xs font-bold ${isActive ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>{step}</p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.productId}-${item.size}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-xl border border-[#f1f5f9] bg-[#fbfaf8] px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#0f172a]">{item.name}</p>
                              <p className="mt-1 text-sm text-[#64748b]">Size {item.size} · Qty {item.quantity}</p>
                            </div>
                            <div className="text-right text-sm font-bold text-[#0f172a]">
                              {formatVnd(item.priceAtPurchase * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <aside className="rounded-xl border border-[#e2e8f0] bg-[#fbfaf8] p-4">
                      <h3 className="font-bold text-[#0f172a]">Shipping details</h3>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div>
                          <dt className="font-semibold text-[#94a3b8]">Recipient</dt>
                          <dd className="mt-1 font-bold text-[#0f172a]">{order.shippingDetails.fullName}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-[#94a3b8]">Phone</dt>
                          <dd className="mt-1 text-[#475569]">{order.shippingDetails.phone}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-[#94a3b8]">Address</dt>
                          <dd className="mt-1 text-[#475569]">{order.shippingDetails.address}</dd>
                        </div>
                      </dl>
                    </aside>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
