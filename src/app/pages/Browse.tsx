import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { getProducts, type ApiProduct } from '../lib/api';
import imgColorBlockTee from '../../imports/Group1/0a1b574084aac0c75514c8e172068e175277fd18.png';
import imgWhiteTee from '../../imports/Group1/24416f7e05d30707ba776bf3f9d518cc0b0feb93.png';
import imgPaintTee from '../../imports/Group1/2b566c36d05a907327c0d36cfa12b303603c2c23.png';
import imgHangerTee from '../../imports/Group1/33bad24226da59c6b6a27cb685979e953b3703c0.png';
import imgBlackModelTee from '../../imports/Group1/5e3944577a47e4fd1ef8f4ce3e2e18b527b4170e.png';
import imgOversizedTee from '../../imports/Group1/66efb28e1e49dd999cc3afd911894e965e8a436a.png';
import imgPocketTee from '../../imports/Group1/7d69fa1c142994884096f1fe177233a83b1cf03d.png';
import imgCatTee from '../../imports/Group1/81e1de7b8266a6c117cc7544489996949f278c70.png';
import imgRackTee from '../../imports/Group1/b862ae571867a625e1ea9be65ffbc2dc8057bebd.png';
import imgSunsetTee from '../../imports/Group1/bbe43010c361832f5f6ddc683cdf378a735b2558.png';
import imgTealSunsetTee from '../../imports/Group1/c12b6744f4e4319e9560410e21fd114efc9babc4.png';
import imgClassicWhiteTee from '../../imports/Group1/c615f070bfe9b4be5fa1c581e82d1c29869687e0.png';

const categories = ['All Designs', 'Graphic Tees', 'Basics', 'Premium', 'Mockups'];
type DesignItem = {
  id: string;
  image: string;
  category: string;
  title: string;
  price: number;
  rating: number;
  reviews: number;
};

const fallbackDesignItems: DesignItem[] = [
  { image: imgColorBlockTee, category: 'Graphic Tees', title: 'Color Block Tee', price: 32.95, rating: 4.8, reviews: 214 },
  { image: imgWhiteTee, category: 'Basics', title: 'Essential White Tee', price: 24.5, rating: 4.7, reviews: 168 },
  { image: imgPaintTee, category: 'Graphic Tees', title: 'Paint Mark Tee', price: 29.75, rating: 4.9, reviews: 96 },
  { image: imgHangerTee, category: 'Basics', title: 'Minimal Hanger Tee', price: 27.25, rating: 4.6, reviews: 143 },
  { image: imgBlackModelTee, category: 'Premium', title: 'Black Studio Tee', price: 34.5, rating: 4.8, reviews: 287 },
  { image: imgOversizedTee, category: 'Premium', title: 'Oversized Graphic Tee', price: 38.95, rating: 4.5, reviews: 78 },
  { image: imgPocketTee, category: 'Basics', title: 'Heather Pocket Tee', price: 31.75, rating: 4.9, reviews: 332 },
  { image: imgCatTee, category: 'Graphic Tees', title: 'Cat Glow Tee', price: 35.4, rating: 4.4, reviews: 51 },
  { image: imgRackTee, category: 'Mockups', title: 'Rack Display Tee', price: 28.2, rating: 4.7, reviews: 119 },
  { image: imgSunsetTee, category: 'Graphic Tees', title: 'Cream Sunset Tee', price: 33.25, rating: 4.6, reviews: 87 },
  { image: imgTealSunsetTee, category: 'Graphic Tees', title: 'Teal Sunset Tee', price: 34.2, rating: 4.9, reviews: 241 },
  { image: imgClassicWhiteTee, category: 'Mockups', title: 'Classic Mockup Tee', price: 26.5, rating: 4.3, reviews: 42 },
].map((item, index) => ({ ...item, id: String(index + 1) }));

function mapApiProduct(product: ApiProduct, index: number): DesignItem {
  const fallback = fallbackDesignItems[index % fallbackDesignItems.length];

  return {
    id: product.id,
    image: product.imageUrl || fallback.image,
    category: product.stock > 0 ? 'Premium' : 'Mockups',
    title: product.name,
    price: product.price,
    rating: fallback.rating,
    reviews: fallback.reviews,
  };
}

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState('All Designs');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Most Popular');
  const [visibleCount, setVisibleCount] = useState(6);
  const [savedDesigns, setSavedDesigns] = useState<string[]>([]);
  const [designItems, setDesignItems] = useState<DesignItem[]>(fallbackDesignItems);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then((products) => {
        if (!isMounted || products.length === 0) return;
        setDesignItems(products.map(mapApiProduct));
        setNotice('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setNotice(error instanceof Error ? error.message : 'Unable to load backend products.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDesigns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = designItems.filter((design) => {
      const matchesCategory = selectedCategory === 'All Designs' || design.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        design.title.toLowerCase().includes(normalizedSearch) ||
        design.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'Newest First') return designItems.indexOf(b) - designItems.indexOf(a);
      if (sort === 'Price: Low to High') return a.price - b.price;
      if (sort === 'Price: High to Low') return b.price - a.price;
      return b.reviews - a.reviews;
    });
  }, [search, selectedCategory, sort]);

  const visibleDesigns = filteredDesigns.slice(0, visibleCount);

  const toggleSavedDesign = (id: string) => {
    setSavedDesigns((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  };

  return (
    <div className="w-full py-12">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Browse Designs
          </h1>
          <p className="text-lg text-[#64748b]">
            Discover thousands of unique AI-generated designs
          </p>
        </div>

        {notice && (
          <div className="mb-6 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#c2410c]">
            Using local product previews because the backend could not be reached: {notice}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4">
          {categories.map((category, i) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setSelectedCategory(category);
                setVisibleCount(6);
              }}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-[#ff9429] text-white shadow-lg'
                  : 'bg-white text-[#64748b] hover:bg-[#f8f7f5] border border-[#e2e8f0]'
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(6);
              }}
              placeholder="Search designs..."
              className="w-full px-6 py-4 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#ffa62b] transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-6 py-4 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#ffa62b]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <option>Most Popular</option>
            <option>Newest First</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-8">
          {visibleDesigns.map((design) => {
            const id = design.id;
            const isSaved = savedDesigns.includes(id);

            return (
            <Link key={`${design.title}-${id}`} to={`/product/${encodeURIComponent(id)}`} className="group">
              <div className="bg-white rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-[#ffa62b] transition-all shadow-sm hover:shadow-xl">
                <div className="aspect-square bg-[#f8f7f5] overflow-hidden relative">
                  <img src={design.image} alt={design.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-[#ff9429]">
                    ${design.price.toFixed(2)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-[#0f172a] mb-2 group-hover:text-[#ff9429] transition-colors">
                    {design.title}
                  </h3>
                  <p className="text-sm text-[#64748b] mb-4">{design.category} AI-generated design</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-semibold text-[#0f172a]">{design.rating.toFixed(1)}</span>
                      <span className="text-xs text-[#94a3b8]">({design.reviews})</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSavedDesign(id);
                      }}
                      className="text-[#ff9429] hover:text-[#ff8c1a]"
                      aria-label={isSaved ? 'Remove saved design' : 'Save design'}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                          fill={isSaved ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth={isSaved ? 0 : 1.5}
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
            );
          })}
        </div>

        {visibleDesigns.length === 0 && (
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-10 text-center">
            <h2 className="font-bold text-[#0f172a]">No designs found</h2>
            <p className="mt-2 text-sm text-[#64748b]">Try another category or search term.</p>
          </div>
        )}

        {/* Load More */}
        {visibleCount < filteredDesigns.length && (
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + 3)}
              className="px-8 py-4 bg-white border-2 border-[#e2e8f0] text-[#0f172a] font-bold rounded-xl hover:border-[#ffa62b] hover:bg-[#fff5eb] transition-all"
            >
              Load More Designs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
