import { useEffect, useMemo, useState } from 'react';
import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router';
import { getProducts, type ApiProduct } from '../lib/api';
import { formatVnd, getTeeProductImage } from '../lib/commerce';

const availabilityOptions = ['All Products', 'In Stock', 'Out of Stock'];

export default function Browse() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [availability, setAvailability] = useState('All Products');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Name');
  const [visibleCount, setVisibleCount] = useState(6);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then((response) => {
        if (!isMounted) return;
        setProducts(response);
        setError('');
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setError(requestError instanceof Error ? requestError.message : 'Unable to load products.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch = !normalizedSearch || product.name.toLowerCase().includes(normalizedSearch);
      const matchesAvailability =
        availability === 'All Products' ||
        (availability === 'In Stock' && product.stock > 0) ||
        (availability === 'Out of Stock' && product.stock === 0);

      return matchesSearch && matchesAvailability;
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'Price: Low to High') return a.price - b.price;
      if (sort === 'Price: High to Low') return b.price - a.price;
      if (sort === 'Stock') return b.stock - a.stock;
      return a.name.localeCompare(b.name);
    });
  }, [availability, products, search, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const toggleSavedProduct = (id: string) => {
    setSavedProducts((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  };

  return (
    <div className="w-full py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#0f172a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Browse Products
          </h1>
          <p className="mt-4 text-lg text-[#64748b]">Explore the latest products from the CoTee catalog.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#b91c1c]">
            Products could not be loaded: {error}
          </div>
        )}

        <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-3">
          {availabilityOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setAvailability(option);
                setVisibleCount(6);
              }}
              className={`whitespace-nowrap rounded-xl px-6 py-3 font-semibold transition-colors ${
                availability === option
                  ? 'bg-[#ff9429] text-white shadow-lg'
                  : 'border border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#ffa62b]'
              }`}
            >
              {option}
            </button>
          ))}
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
              placeholder="Search products..."
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
            <option>Stock</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
                <div className="aspect-square animate-pulse bg-[#e2e8f0]" />
                <div className="space-y-3 p-6">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#e2e8f0]" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-[#f1f5f9]" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleProducts.length > 0 ? (
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
            <h2 className="font-bold text-[#0f172a]">{error ? 'Products unavailable' : 'No products found'}</h2>
            <p className="mt-2 text-sm text-[#64748b]">
              {error ? 'Try again after the API is available.' : 'Try another availability filter or search term.'}
            </p>
          </div>
        )}

        {visibleCount < filteredProducts.length && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + 6)}
              className="rounded-xl border-2 border-[#e2e8f0] bg-white px-8 py-4 font-bold text-[#0f172a] transition-colors hover:border-[#ffa62b] hover:bg-[#fff5eb]"
            >
              Load More Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
