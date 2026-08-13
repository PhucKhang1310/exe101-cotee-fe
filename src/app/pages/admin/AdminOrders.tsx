import { useEffect, useMemo, useState } from 'react';
import { Ban, Check, RefreshCw, RotateCcw, Save, Search, X } from 'lucide-react';
import { getProducts, type ApiProduct } from '../../lib/api';
import { cancelOrder, getAdminOrders, updateOrderStatus, type AdminOrder } from '../../lib/adminApi';
import { formatVnd, getTeeProductImage } from '../../lib/commerce';
import { Skeleton } from '../../components/ui/skeleton';

const orderStatuses = ['Pending', 'Processing', 'Shipping', 'Completed', 'Cancelled'];
const paymentStatuses = ['Pending', 'Paid', 'Failed'];
const fulfillmentTimeline = ['Pending', 'Processing', 'Shipping', 'Completed'];

const nextOrderStatuses: Record<string, string[]> = {
  Pending: ['Pending', 'Processing', 'Cancelled'],
  Processing: ['Processing', 'Shipping', 'Cancelled'],
  Shipping: ['Shipping', 'Completed'],
  Completed: ['Completed'],
  Cancelled: ['Cancelled'],
};

const statusClasses: Record<string, string> = {
  Pending: 'border-orange-200 bg-blue-50 text-blue-700',
  Processing: 'border-blue-200 bg-blue-50 text-blue-700',
  Shipping: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  Completed: 'border-green-200 bg-green-50 text-green-700',
  Cancelled: 'border-red-200 bg-red-50 text-red-700',
  Paid: 'border-green-200 bg-green-50 text-green-700',
  Failed: 'border-red-200 bg-red-50 text-red-700',
};

type DraftState = {
  orderStatus: string;
  paymentStatus: string;
};

function getDraft(order: AdminOrder, drafts: Record<string, DraftState>): DraftState {
  return drafts[order.id] ?? {
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
  };
}

function getAllowedOrderStatuses(order: AdminOrder) {
  return nextOrderStatuses[order.orderStatus] ?? [order.orderStatus];
}

function isInvalidCombination(draft: DraftState) {
  return (
    (draft.paymentStatus === 'Paid' && (draft.orderStatus === 'Pending' || draft.orderStatus === 'Cancelled')) ||
    (draft.paymentStatus === 'Failed' && draft.orderStatus === 'Completed')
  );
}

function OrderTimeline({ currentStatus, draftStatus }: { currentStatus: string; draftStatus: string }) {
  if (draftStatus === 'Cancelled') {
    return (
      <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-600 text-white">
            <X className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-red-700">Order cancelled</p>
            <p className="text-xs font-semibold text-red-500">No further status transitions are available.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = Math.max(0, fulfillmentTimeline.indexOf(currentStatus));
  const draftIndex = Math.max(0, fulfillmentTimeline.indexOf(draftStatus));

  return (
    <div className="mt-4">
      <div className="grid grid-cols-4 gap-2">
        {fulfillmentTimeline.map((status, index) => {
          const isCurrent = currentStatus === status;
          const isDraft = draftStatus === status && draftStatus !== currentStatus;
          const isComplete = index <= currentIndex;
          const isPreview = index > currentIndex && index <= draftIndex;
          const isActive = isComplete || isPreview;

          return (
            <div key={status} className="min-w-0">
              <div className="flex items-center">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 text-xs font-extrabold ${
                    isDraft
                      ? 'border-[#315fae] bg-[#315fae] text-white'
                      : isComplete
                        ? 'border-green-500 bg-green-500 text-white'
                        : isPreview
                          ? 'border-[#315fae] bg-[#eef8ff] text-[#244f92]'
                          : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {isComplete && !isDraft ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                {index < fulfillmentTimeline.length - 1 && (
                  <span
                    className={`h-1 min-w-6 flex-1 rounded-lg ${
                      index < currentIndex
                        ? 'bg-green-500'
                        : index < draftIndex
                          ? 'bg-[#315fae]'
                          : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
              <p className={`mt-2 truncate text-xs font-bold ${isActive ? 'text-slate-950' : 'text-slate-400'}`}>
                {status}
              </p>
              {isCurrent && <p className="mt-1 text-[11px] font-semibold text-green-600">Current</p>}
              {isDraft && <p className="mt-1 text-[11px] font-semibold text-[#244f92]">Next</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [nextOrders, nextProducts] = await Promise.all([getAdminOrders(), getProducts()]);
      setOrders(nextOrders);
      setProducts(nextProducts);
      setDrafts({});
      setNotice('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) =>
      !term ||
      order.orderCode.toLowerCase().includes(term) ||
      order.paymentStatus.toLowerCase().includes(term) ||
      order.orderStatus.toLowerCase().includes(term) ||
      order.shippingDetails.fullName.toLowerCase().includes(term) ||
      order.shippingDetails.phone.includes(term) ||
      order.items.some((item) => item.name.toLowerCase().includes(term)),
    );
  }, [orders, search]);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const setDraft = (order: AdminOrder, patch: Partial<DraftState>) => {
    setDrafts((current) => {
      const currentDraft = getDraft(order, current);
      const nextDraft = { ...currentDraft, ...patch };

      if (patch.paymentStatus === 'Paid' && nextDraft.orderStatus === 'Pending') {
        nextDraft.orderStatus = 'Processing';
      }

      if (patch.orderStatus === 'Cancelled' && nextDraft.paymentStatus === 'Paid') {
        nextDraft.paymentStatus = 'Failed';
      }

      return { ...current, [order.id]: nextDraft };
    });
  };

  const resetDraft = (order: AdminOrder) => {
    setDrafts((current) => {
      const { [order.id]: _removed, ...rest } = current;
      return rest;
    });
  };

  const save = async (order: AdminOrder) => {
    const draft = getDraft(order, drafts);
    if (isInvalidCombination(draft)) {
      setNotice('Choose a valid payment and status combination before saving.');
      return;
    }

    setSavingCode(order.orderCode);
    setNotice('');

    try {
      const updated = await updateOrderStatus(order.orderCode, {
        orderStatus: draft.orderStatus,
        paymentStatus: draft.paymentStatus,
      });
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
      resetDraft(updated);
      setNotice(`Order ${updated.orderCode} updated.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to update order.');
    } finally {
      setSavingCode('');
    }
  };

  const cancel = async (order: AdminOrder) => {
    if (!window.confirm(`Cancel order ${order.orderCode}?`)) return;
    setSavingCode(order.orderCode);
    setNotice('');

    try {
      const updated = await cancelOrder(order.orderCode);
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
      resetDraft(updated);
      setNotice(`Order ${updated.orderCode} cancelled.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to cancel order.');
    } finally {
      setSavingCode('');
    }
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold">Order State Management</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#5a7899]">
            Update payment and order status for customer orders. Paid orders move into processing, then shipping, then completed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-[#6ecdf0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {notice && <div className="mt-5 rounded-lg border border-orange-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{notice}</div>}

      <label className="mt-6 flex min-h-12 max-w-2xl items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
        <Search className="h-5 w-5 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order, customer, item, or status"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Current</th>
                <th className="px-5 py-4">Update State</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t align-top">
                      <td className="px-5 py-4">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="mt-2 h-3 w-36" />
                      </td>
                      <td className="px-5 py-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="mt-1 h-3 w-24" />
                        <Skeleton className="mt-1 h-3 w-48" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-[280px] rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                          <Skeleton className="h-64 w-64 rounded-lg" />
                          <Skeleton className="mt-3 h-4 w-40" />
                          <Skeleton className="mt-1 h-3 w-28" />
                        </div>
                      </td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-5 py-4">
                        <Skeleton className="h-6 w-28 rounded-lg" />
                        <Skeleton className="mt-2 h-6 w-28 rounded-lg" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="grid max-w-sm grid-cols-2 gap-3">
                          <Skeleton className="h-10 rounded-lg" />
                          <Skeleton className="h-10 rounded-lg" />
                        </div>
                        <Skeleton className="mt-4 h-16 w-full rounded-lg" />
                        <div className="mt-4 flex gap-2">
                          <Skeleton className="h-10 w-36 rounded-lg" />
                          <Skeleton className="h-10 w-24 rounded-lg" />
                          <Skeleton className="h-10 w-28 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))
                : visible.map((order) => {
                const draft = getDraft(order, drafts);
                const hasChanges = draft.orderStatus !== order.orderStatus || draft.paymentStatus !== order.paymentStatus;
                const invalid = isInvalidCombination(draft);
                const isSaving = savingCode === order.orderCode;
                const canCancel = order.paymentStatus !== 'Paid' && order.orderStatus !== 'Cancelled';

                return (
                  <tr key={order.id} className="border-t align-top">
                    <td className="px-5 py-4">
                      <strong className="block text-slate-950">{order.orderCode}</strong>
                      <span className="mt-1 block text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <strong className="block text-slate-950">{order.shippingDetails.fullName}</strong>
                      <span className="block text-xs text-slate-500">{order.shippingDetails.phone}</span>
                      <span className="block max-w-64 text-xs leading-5 text-slate-400">{order.shippingDetails.address}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-3">
                        {order.items.map((item) => {
                          const product = productMap.get(item.productId);
                          const imageUrl = product?.imageUrl || getTeeProductImage(item.productId);

                          return (
                            <div key={`${item.productId}-${item.size}`} className="w-[280px] rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                              <div className="h-64 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                {imageUrl ? (
                                  <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                ) : (
                                  <div className="grid h-full w-full place-items-center text-[10px] font-bold uppercase text-slate-300">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 min-w-0">
                                <p className="text-sm font-bold leading-5 text-slate-800">{item.name}</p>
                                <p className="mt-1 text-xs text-slate-500">Size {item.size} · Qty {item.quantity}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-950">{formatVnd(order.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`w-fit rounded-lg border px-3 py-1 text-xs font-bold ${statusClasses[order.paymentStatus] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                          Payment: {order.paymentStatus}
                        </span>
                        <span className={`w-fit rounded-lg border px-3 py-1 text-xs font-bold ${statusClasses[order.orderStatus] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                          Order: {order.orderStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid max-w-sm grid-cols-2 gap-3">
                        <label className="text-xs font-bold uppercase text-slate-500">
                          Payment
                          <select
                            value={draft.paymentStatus}
                            onChange={(event) => setDraft(order, { paymentStatus: event.target.value })}
                            disabled={isSaving || order.orderStatus === 'Completed'}
                            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#6ecdf0] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {paymentStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs font-bold uppercase text-slate-500">
                          Status
                          <select
                            value={draft.orderStatus}
                            onChange={(event) => setDraft(order, { orderStatus: event.target.value })}
                            disabled={isSaving}
                            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#6ecdf0] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {getAllowedOrderStatuses(order).map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      {invalid && (
                        <p className="mt-2 max-w-sm text-xs font-semibold text-red-600">
                          Paid orders must be processing or later. Failed payments cannot be completed.
                        </p>
                      )}
                      <OrderTimeline currentStatus={order.orderStatus} draftStatus={draft.orderStatus} />

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void save(order)}
                          disabled={!hasChanges || invalid || isSaving}
                          className="inline-flex min-h-10 min-w-36 items-center justify-center gap-2 rounded-lg bg-[#315fae] px-4 text-sm font-bold text-white hover:bg-[#244f92] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Saving...' : 'Apply update'}
                        </button>
                        <button
                          type="button"
                          onClick={() => resetDraft(order)}
                          disabled={!hasChanges || isSaving}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:border-[#6ecdf0] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Discard
                        </button>
                        <button
                          type="button"
                          onClick={() => void cancel(order)}
                          disabled={!canCancel || isSaving}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Ban className="h-4 w-4" />
                          Cancel order
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t px-5 py-4 text-sm text-slate-500">
          {loading ? <Skeleton className="h-4 w-24" /> : `${visible.length} orders`}
        </div>
      </section>
    </div>
  );
}
