import { useEffect, useMemo, useState } from 'react';
import { Check, Heart, ImageOff, Palette, Search, Shirt, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getCloudinaryBrowseAssets, type CloudinaryBrowseAsset } from '../lib/cloudinaryAssets';

type BrowseMode = 'all' | 'shirt' | 'design';
type AssetKind = Exclude<BrowseMode, 'all'>;
type BrowseItem = CloudinaryBrowseAsset;

const browseModes: Array<{ id: BrowseMode; label: string; icon: LucideIcon }> = [
  { id: 'all', label: 'All Assets', icon: Search },
  { id: 'shirt', label: 'Shirts', icon: Shirt },
  { id: 'design', label: 'Designs', icon: Palette },
];

const previewStyles: Record<AssetKind, React.CSSProperties> = {
  shirt: { backgroundColor: '#f3faff' },
  design: { backgroundColor: '#eef8ff' },
};

function filterAndSortItems(items: BrowseItem[], search: string, sort: string) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredItems = normalizedSearch
    ? items.filter((item) =>
        [item.name, item.description, item.meta, item.kind, ...item.tags].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        ),
      )
    : items;

  return [...filteredItems].sort((first, second) => {
    if (sort === 'Newest') {
      return second.id.localeCompare(first.id);
    }

    return first.name.localeCompare(second.name);
  });
}

export default function Browse() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<BrowseMode>('all');
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Name');
  const [visibleCount, setVisibleCount] = useState(6);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [shirtViews, setShirtViews] = useState<Record<string, 'front' | 'back'>>({});
  const [selectedShirtId, setSelectedShirtId] = useState('');
  const [selectedDesignId, setSelectedDesignId] = useState('');

  useEffect(() => {
    setItems(getCloudinaryBrowseAssets());
  }, []);

  const shirtItems = useMemo(() => items.filter((item) => item.kind === 'shirt'), [items]);
  const designItems = useMemo(() => items.filter((item) => item.kind === 'design'), [items]);
  const activeItems = mode === 'all' ? items : mode === 'design' ? designItems : shirtItems;

  const filteredItems = useMemo(() => filterAndSortItems(activeItems, search, sort), [activeItems, search, sort]);
  const filteredShirts = useMemo(() => filterAndSortItems(shirtItems, search, sort), [shirtItems, search, sort]);
  const filteredDesigns = useMemo(() => filterAndSortItems(designItems, search, sort), [designItems, search, sort]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const selectedShirt = useMemo(
    () => shirtItems.find((item) => item.id === selectedShirtId),
    [selectedShirtId, shirtItems],
  );
  const selectedDesign = useMemo(
    () => designItems.find((item) => item.id === selectedDesignId),
    [selectedDesignId, designItems],
  );
  const hasStudioSelection = Boolean(selectedShirt || selectedDesign);

  const toggleSavedItem = (id: string) => {
    setSavedItems((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  };

  const setShirtView = (id: string, view: 'front' | 'back') => {
    setShirtViews((current) => ({ ...current, [id]: view }));
  };

  const selectStudioAsset = (item: BrowseItem) => {
    if (item.kind === 'shirt') {
      setSelectedShirtId(item.id);
      return;
    }

    setSelectedDesignId(item.id);
  };

  const openStudio = () => {
    const params = new URLSearchParams();
    if (selectedShirt) params.set('shirt', selectedShirt.id);
    if (selectedDesign) params.set('design', selectedDesign.id);

    navigate(`/dashboard${params.size > 0 ? `?${params.toString()}` : ''}`);
  };

  const renderAssetCard = (item: BrowseItem, compact = false) => {
    const isSaved = savedItems.includes(item.id);
    const isDesign = item.kind === 'design';
    const isSelected = item.kind === 'shirt' ? selectedShirtId === item.id : selectedDesignId === item.id;
    const shirtView = shirtViews[item.id] ?? 'front';
    const imageUrl = item.kind === 'shirt' && shirtView === 'back' && item.backImageUrl ? item.backImageUrl : item.imageUrl;

    return (
      <article
        key={item.id}
        className={`group overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all hover:border-[#6ecdf0] hover:shadow-xl ${
          isSelected ? 'border-[#315fae] shadow-lg shadow-blue-100' : 'border-transparent'
        } ${
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
            <div className="grid h-full place-items-center text-[#8ca9c5]">
              <ImageOff className="h-12 w-12" />
            </div>
          )}

          {item.kind === 'shirt' && item.backImageUrl && (
            <div className="absolute right-4 top-4 flex rounded-full bg-white/90 p-1 text-sm font-semibold text-[#5a7899] shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setShirtView(item.id, 'front')}
                className={`rounded-full px-3 py-1 transition-colors ${
                  shirtView === 'front' ? 'bg-[#315fae] text-white' : 'hover:bg-[#eaf7ff]'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setShirtView(item.id, 'back')}
                className={`rounded-full px-3 py-1 transition-colors ${
                  shirtView === 'back' ? 'bg-[#315fae] text-white' : 'hover:bg-[#eaf7ff]'
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
              <h2 className="font-bold text-[#102a56] transition-colors group-hover:text-[#315fae]">{item.name}</h2>
              <p className="mt-2 text-sm text-[#5a7899]">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleSavedItem(item.id)}
              className="shrink-0 text-[#315fae]"
              aria-label={isSaved ? `Remove saved ${item.name}` : `Save ${item.name}`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => selectStudioAsset(item)}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
              isSelected
                ? 'bg-[#315fae] text-white'
                : 'border border-[#b8d2e8] bg-[#eef8ff] text-[#244f92] hover:bg-[#d8effc]'
            }`}
          >
            {isSelected ? <Check className="h-4 w-4" /> : item.kind === 'shirt' ? <Shirt className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
            {isSelected ? 'Selected for Studio' : `Select ${item.kind === 'shirt' ? 'Shirt' : 'Design'}`}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className={`w-full py-12 ${hasStudioSelection ? 'pb-40' : ''}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#102a56]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Browse Assets
          </h1>
          <p className="mt-4 text-lg text-[#5a7899]">Pick a design graphic or a plain shirt base for your next CoTee mockup.</p>
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
                    ? 'bg-[#315fae] text-white shadow-lg'
                    : 'border border-[#c9deef] bg-white text-[#5a7899] hover:border-[#6ecdf0]'
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
              className="w-full rounded-xl border border-[#c9deef] bg-white px-6 py-4 pr-12 focus:border-[#6ecdf0] focus:outline-none"
            />
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ca9c5]" />
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-[#c9deef] bg-white px-6 py-4 focus:border-[#6ecdf0] focus:outline-none"
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
                  <h2 className="text-2xl font-bold text-[#102a56]">Shirt</h2>
                  <p className="mt-1 text-sm text-[#5a7899]">Plain shirt bases from Cloudinary.</p>
                </div>
                <span className="text-sm font-semibold text-[#8ca9c5]">{filteredShirts.length} items</span>
              </div>
              {filteredShirts.length > 0 ? (
                <div className="-mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  {filteredShirts.map((item) => renderAssetCard(item, true))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#c9deef] bg-white p-8 text-center text-sm text-[#5a7899]">
                  No shirts found.
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#102a56]">Design</h2>
                  <p className="mt-1 text-sm text-[#5a7899]">Standalone graphics from Cloudinary.</p>
                </div>
                <span className="text-sm font-semibold text-[#8ca9c5]">{filteredDesigns.length} items</span>
              </div>
              {filteredDesigns.length > 0 ? (
                <div className="-mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  {filteredDesigns.map((item) => renderAssetCard(item, true))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#c9deef] bg-white p-8 text-center text-sm text-[#5a7899]">
                  No designs found.
                </div>
              )}
            </section>
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => renderAssetCard(item))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#c9deef] bg-white p-10 text-center">
            <h2 className="font-bold text-[#102a56]">No {mode === 'design' ? 'designs' : 'shirts'} found</h2>
            <p className="mt-2 text-sm text-[#5a7899]">Try another search term.</p>
          </div>
        )}

        {mode !== 'all' && visibleCount < filteredItems.length && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + 6)}
              className="rounded-xl border-2 border-[#c9deef] bg-white px-8 py-4 font-bold text-[#102a56] transition-colors hover:border-[#6ecdf0] hover:bg-[#eaf7ff]"
            >
              Load More {mode === 'design' ? 'Designs' : 'Shirts'}
            </button>
          </div>
        )}
      </div>
      {hasStudioSelection && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#b8d2e8] bg-white/95 shadow-2xl shadow-slate-400/20 backdrop-blur">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#c9deef] bg-[#f3faff] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8ca9c5]">Shirt</p>
                  <p className="truncate text-sm font-bold text-[#102a56]">{selectedShirt?.name ?? 'No shirt selected'}</p>
                </div>
                {selectedShirt && (
                  <button
                    type="button"
                    onClick={() => setSelectedShirtId('')}
                    className="rounded-lg p-2 text-[#5a7899] transition-colors hover:bg-white hover:text-[#102a56]"
                    aria-label="Clear selected shirt"
                    title="Clear selected shirt"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#c9deef] bg-[#f3faff] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8ca9c5]">Design</p>
                  <p className="truncate text-sm font-bold text-[#102a56]">{selectedDesign?.name ?? 'No design selected'}</p>
                </div>
                {selectedDesign && (
                  <button
                    type="button"
                    onClick={() => setSelectedDesignId('')}
                    className="rounded-lg p-2 text-[#5a7899] transition-colors hover:bg-white hover:text-[#102a56]"
                    aria-label="Clear selected design"
                    title="Clear selected design"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={openStudio}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315fae] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-[#244f92]"
            >
              Open Studio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
