import { useEffect, useMemo, useState } from 'react';
import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router';
import { getProducts, type ApiProduct } from '../lib/api';
import { formatVnd, getTeeProductImage } from '../lib/commerce';

type BrowseMode = 'all' | 'shirt' | 'design';
type AssetKind = Exclude<BrowseMode, 'all'>;

export default function Browse() {
  const [mode, setMode] = useState<BrowseMode>('all');
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Name');
  const [visibleCount, setVisibleCount] = useState(6);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [shirtViews, setShirtViews] = useState<Record<string, 'front' | 'back'>>({});

  useEffect(() => {
    setItems(getCloudinaryBrowseAssets().map(toBrowseItem));
  }, []);

  const shirtItems = useMemo(() => items.filter((item) => item.kind === 'shirt'), [items]);
  const designItems = useMemo(() => items.filter((item) => item.kind === 'design'), [items]);
  const activeItems = mode === 'all' ? items : mode === 'design' ? designItems : shirtItems;

  const filteredItems = useMemo(() => filterAndSortItems(activeItems, search, sort), [activeItems, search, sort]);
  const filteredShirts = useMemo(() => filterAndSortItems(shirtItems, search, sort), [shirtItems, search, sort]);
  const filteredDesigns = useMemo(() => filterAndSortItems(designItems, search, sort), [designItems, search, sort]);

  const visibleItems = filteredItems.slice(0, visibleCount);

  const toggleSavedItem = (id: string) => {
    setSavedItems((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  };

  const setShirtView = (id: string, view: 'front' | 'back') => {
    setShirtViews((current) => ({ ...current, [id]: view }));
  };

  const renderAssetCard = (item: BrowseItem, compact = false) => {
    const isSaved = savedItems.includes(item.id);
    const isDesign = item.kind === 'design';
    const shirtView = shirtViews[item.id] ?? 'front';
    const imageUrl = item.kind === 'shirt' && shirtView === 'back' && item.backImageUrl ? item.backImageUrl : item.imageUrl;

    return (
      <article
        key={item.id}
        className={`group overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-sm transition-all hover:border-[#ffa62b] hover:shadow-xl ${
          compact ? 'w-[300px] shrink-0 snap-start sm:w-[340px]' : ''
        }`}
      >
        <div
          className="relative aspect-square overflow-hidden"
          style={isDesign ? previewStyles.design : previewStyles.shirt}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${
                isDesign ? 'object-contain p-7' : 'object-cover'
              }`}
            />
          ) : (
            <div className="grid h-full place-items-center text-[#94a3b8]">
              <ImageOff className="h-12 w-12" />
            </div>
          )}

          {item.kind === 'shirt' && item.backImageUrl && (
            <div className="absolute right-4 top-4 flex rounded-full bg-white/90 p-1 text-sm font-semibold text-[#64748b] shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setShirtView(item.id, 'front')}
                className={`rounded-full px-3 py-1 transition-colors ${
                  shirtView === 'front' ? 'bg-[#ff9429] text-white' : 'hover:bg-[#fff5eb]'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setShirtView(item.id, 'back')}
                className={`rounded-full px-3 py-1 transition-colors ${
                  shirtView === 'back' ? 'bg-[#ff9429] text-white' : 'hover:bg-[#fff5eb]'
                }`}
              >
                Back
              </button>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-[#0f172a] transition-colors group-hover:text-[#ff9429]">{item.name}</h2>
              <p className="mt-2 text-sm text-[#64748b]">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleSavedItem(item.id)}
              className="shrink-0 text-[#ff9429]"
              aria-label={isSaved ? `Remove saved ${item.name}` : `Save ${item.name}`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="w-full py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#0f172a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Browse Assets
          </h1>
          <p className="mt-4 text-lg text-[#64748b]">Pick a design graphic or a plain shirt base for your next CoTee mockup.</p>
        </div>

        <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-3">
          {browseModes.map((option) => {
            const Icon = option.icon;
            const isActive = mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setMode(option.id);
                  setSearch('');
                  setVisibleCount(6);
                }}
                className={`flex min-w-[144px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#ff9429] text-white shadow-lg'
                    : 'border border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#ffa62b]'
                }`}
              >
                <Icon className="h-5 w-5" />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisibleCount(6);
              }}
              placeholder={mode === 'all' ? 'Search assets...' : mode === 'design' ? 'Search designs...' : 'Search shirts...'}
              className="w-full rounded-xl border border-[#e2e8f0] bg-white px-6 py-4 pr-12 focus:border-[#ffa62b] focus:outline-none"
            />
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-[#e2e8f0] bg-white px-6 py-4 focus:border-[#ffa62b] focus:outline-none"
          >
            <option>Name</option>
            <option>Newest</option>
          </select>
        </div>

        {mode === 'all' ? (
          <div className="space-y-12">
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#0f172a]">Shirt</h2>
                  <p className="mt-1 text-sm text-[#64748b]">Plain shirt bases from Cloudinary.</p>
                </div>
                <span className="text-sm font-semibold text-[#94a3b8]">{filteredShirts.length} items</span>
              </div>
              {filteredShirts.length > 0 ? (
                <div className="-mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  {filteredShirts.map((item) => renderAssetCard(item, true))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center text-sm text-[#64748b]">
                  No shirts found.
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#0f172a]">Design</h2>
                  <p className="mt-1 text-sm text-[#64748b]">Standalone graphics from Cloudinary.</p>
                </div>
                <span className="text-sm font-semibold text-[#94a3b8]">{filteredDesigns.length} items</span>
              </div>
              {filteredDesigns.length > 0 ? (
                <div className="-mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  {filteredDesigns.map((item) => renderAssetCard(item, true))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center text-sm text-[#64748b]">
                  No designs found.
                </div>
              )}
            </section>
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => {
              const isSaved = savedProducts.includes(product.id);
              return (
                <Link key={product.id} to={`/product/${encodeURIComponent(product.id)}`} className="group">
                  <div className="overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-sm transition-all group-hover:border-[#ffa62b] group-hover:shadow-xl">
                    <div className="relative aspect-square overflow-hidden bg-[#f8f7f5]">
                      <img src={getTeeProductImage(product.id)} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-[#ff9429] backdrop-blur-sm">
                        {formatVnd(product.price)}
                      </div>
                    </div>
                    <div className="p-6">
                      <h2 className="font-bold text-[#0f172a] transition-colors group-hover:text-[#ff9429]">{product.name}</h2>
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'}`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleSavedProduct(product.id);
                          }}
                          className="text-[#ff9429]"
                          aria-label={isSaved ? 'Remove saved product' : 'Save product'}
                        >
                          <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-10 text-center">
            <h2 className="font-bold text-[#0f172a]">No {mode === 'design' ? 'designs' : 'shirts'} found</h2>
            <p className="mt-2 text-sm text-[#64748b]">Try another search term.</p>
          </div>
        )}

        {mode !== 'all' && visibleCount < filteredItems.length && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + 6)}
              className="rounded-xl border-2 border-[#e2e8f0] bg-white px-8 py-4 font-bold text-[#0f172a] transition-colors hover:border-[#ffa62b] hover:bg-[#fff5eb]"
            >
              Load More {mode === 'design' ? 'Designs' : 'Shirts'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
