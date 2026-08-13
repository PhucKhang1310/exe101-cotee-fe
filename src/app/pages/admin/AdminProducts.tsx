import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { getProducts, type ApiProduct } from '../../lib/api';
import { createProduct, deleteProduct, updateProduct } from '../../lib/adminApi';
import { formatVnd, getTeeProductImage } from '../../lib/commerce';
import { Skeleton } from '../../components/ui/skeleton';


// ─── Image crop editor ──────────────────────────────────────────────────────
// Facebook/Discord-style: image is draggable & zoomable behind a square crop window.
// On "Apply", the crop is rasterised to canvas and stored as a data URL in LS.

const CROP_LS_KEY = 'cotee_product_crop';

function loadCrops(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CROP_LS_KEY) ?? '{}') as Record<string, string>; }
  catch { return {}; }
}
function saveCrop(productId: string, dataUrl: string) {
  localStorage.setItem(CROP_LS_KEY, JSON.stringify({ ...loadCrops(), [productId]: dataUrl }));
}
function getCrop(productId: string): string | null {
  return loadCrops()[productId] ?? null;
}

function ImageCropEditor({
  imageUrl,
  productId,
  onApply,
  onCancel,
}: {
  imageUrl: string;
  productId: string;
  onApply: (croppedDataUrl: string) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const apply = () => {
    if (!croppedAreaPixels || !canvasRef.current) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current!;
      const OUT = 512;
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 0, OUT, OUT,
      );
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      saveCrop(productId, dataUrl);
      onApply(dataUrl);
    };
    img.src = imageUrl;
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-3xl flex-col gap-5 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-extrabold text-slate-900">Crop Image</h4>
            <p className="text-xs text-slate-500">Drag to pan · Scroll or slider to zoom</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop area — fills at least 40% of viewport height, capped so the panel stays on screen */}
        <div
          className="relative w-full overflow-hidden rounded-xl bg-slate-900"
          style={{ height: 'min(60vh, calc(90vw - 6rem))' }}
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-400">−</span>
          <input
            type="range"
            min={1} max={3} step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#315fae]"
          />
          <span className="text-sm font-bold text-slate-400">+</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex-1 rounded-xl bg-[#315fae] py-3 text-sm font-bold text-white hover:bg-[#244f92] transition-colors"
          >
            Apply Crop
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const emptyForm = { name: '', imageUrl: '', price: '', stock: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [cropVersion, setCropVersion] = useState(0); // bump to re-read localStorage

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

  const formImageUrl = form.imageUrl || (editing ? getTeeProductImage(editing.id) : '');
  const editingId = editing?.id ?? `new-${form.name}`;

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex items-end justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold">Product Management</h2><p className="mt-2 text-sm text-[#5a7899]">Create products and control pricing and stock.</p></div>
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 rounded-xl bg-[#315fae] px-5 py-3 font-bold text-white"><Plus className="h-4 w-4" /> Add product</button>
      </div>
      {notice && <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</div>}
      <label className="mt-6 flex max-w-xl items-center gap-3 rounded-xl border bg-white px-4 py-3"><Search className="h-5 w-5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="flex-1 outline-none" /></label>

      <div key={cropVersion} className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-2 h-5 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="mt-5 flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </div>
            ))
          : visible.map((product) => {
            // Prefer locally-cropped version, fall back to remote imageUrl, then mockup
            const rawUrl = product.imageUrl || getTeeProductImage(product.id);
            const imageUrl = getCrop(product.id) || rawUrl;
            return (
              <article key={product.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-bold uppercase text-slate-300">
                      No image
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold">{product.name}</h3>
                    <p className="mt-1 text-lg font-bold text-[#315fae]">{formatVnd(product.price)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${product.stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock} in stock
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openForm(product)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 font-semibold">
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => void remove(product)} className="rounded-xl border px-3 text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4">
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex justify-between">
              <h3 className="text-xl font-extrabold">{editing ? 'Edit product' : 'Create product'}</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-4">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="w-full rounded-xl border px-4 py-3" />
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL" className="w-full rounded-xl border px-4 py-3" />

              {/* Crop button — shown when image is available */}
              {formImageUrl && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <img
                      src={getCrop(editingId) || formImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700">Image preview</p>
                    <p className="text-xs text-slate-400 truncate">{getCrop(editingId) ? 'Custom crop applied' : 'Using original image'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCropEditor(true)}
                    className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[#6ecdf0] hover:text-[#315fae] transition-colors"
                  >
                    Crop
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <input required min="0" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (VND)" className="rounded-xl border px-4 py-3" />
                <input required min="0" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="rounded-xl border px-4 py-3" />
              </div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-[#315fae] px-5 py-3 font-bold text-white">Save product</button>
          </form>
        </div>
      )}

      {/* Full-screen crop editor — rendered outside the form modal */}
      {showCropEditor && formImageUrl && (
        <ImageCropEditor
          imageUrl={formImageUrl}
          productId={editingId}
          onApply={() => {
            setCropVersion((v) => v + 1);
            setShowCropEditor(false);
          }}
          onCancel={() => setShowCropEditor(false)}
        />
      )}
    </div>
  );
}
