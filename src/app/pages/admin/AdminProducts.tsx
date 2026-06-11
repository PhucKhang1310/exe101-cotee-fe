import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { getProducts, type ApiProduct } from '../../lib/api';
import { createProduct, deleteProduct, updateProduct } from '../../lib/adminApi';
import { formatVnd } from '../../lib/commerce';

const emptyForm = { name: '', imageUrl: '', price: '', stock: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try { setProducts(await getProducts()); setNotice(''); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to load products.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => products.filter((product) =>
    product.name.toLowerCase().includes(search.trim().toLowerCase())), [products, search]);

  const openForm = (product?: ApiProduct) => {
    setEditing(product ?? null);
    setForm(product ? {
      name: product.name, imageUrl: product.imageUrl ?? '',
      price: String(product.price), stock: String(product.stock),
    } : emptyForm);
    setShowForm(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { name: form.name, imageUrl: form.imageUrl, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editing) await updateProduct(editing.id, payload);
      else await createProduct(payload);
      setShowForm(false);
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to save product.'); }
  };

  const remove = async (product: ApiProduct) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try { await deleteProduct(product.id); await load(); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to delete product.'); }
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex items-end justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold">Product Management</h2><p className="mt-2 text-sm text-[#64748b]">Create products and control pricing and stock.</p></div>
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 rounded-xl bg-[#ff9429] px-5 py-3 font-bold text-white"><Plus className="h-4 w-4" /> Add product</button>
      </div>
      {notice && <div className="mt-5 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700">{notice}</div>}
      <label className="mt-6 flex max-w-xl items-center gap-3 rounded-xl border bg-white px-4 py-3"><Search className="h-5 w-5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="flex-1 outline-none" /></label>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((product) => (
          <article key={product.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="font-extrabold">{product.name}</h3><p className="mt-1 text-lg font-bold text-[#ff9429]">{formatVnd(product.price)}</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.stock} in stock</span>
            </div>
            {product.imageUrl && <p className="mt-4 truncate text-xs text-slate-400">{product.imageUrl}</p>}
            <div className="mt-5 flex gap-2">
              <button onClick={() => openForm(product)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 font-semibold"><Pencil className="h-4 w-4" /> Edit</button>
              <button onClick={() => void remove(product)} className="rounded-xl border px-3 text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </article>
        ))}
      </div>
      {loading && <p className="mt-6 text-sm text-slate-500">Loading products...</p>}

      {showForm && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4">
          <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6">
            <div className="flex justify-between"><h3 className="text-xl font-extrabold">{editing ? 'Edit product' : 'Create product'}</h3><button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button></div>
            <div className="mt-5 space-y-4">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="w-full rounded-xl border px-4 py-3" />
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL" className="w-full rounded-xl border px-4 py-3" />
              <div className="grid grid-cols-2 gap-3">
                <input required min="0" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (VND)" className="rounded-xl border px-4 py-3" />
                <input required min="0" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="rounded-xl border px-4 py-3" />
              </div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-[#ff9429] px-5 py-3 font-bold text-white">Save product</button>
          </form>
        </div>
      )}
    </div>
  );
}
