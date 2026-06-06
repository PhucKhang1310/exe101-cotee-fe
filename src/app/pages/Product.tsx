import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, ImageOff, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { addCartItem as addApiCartItem, getProduct, getProducts, type ApiProduct } from '../lib/api';
import { addCartItem as addLocalCartItem, isAuthenticated } from '../lib/store';

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

function formatPrice(priceInCents: number) {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

function ProductImage({ product, className }: { product: ApiProduct; className?: string }) {
  if (product.imageUrl) {
    return <img src={product.imageUrl} alt={product.name} className={className} />;
  }

  return (
    <div className={`grid place-items-center bg-[#f8f7f5] text-[#94a3b8] ${className ?? ''}`}>
      <ImageOff className="h-14 w-14" />
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Product ID is missing.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError('');

    Promise.all([getProduct(id), getProducts()])
      .then(([productResponse, productsResponse]) => {
        if (!isMounted) return;
        setProduct(productResponse);
        setRelatedProducts(productsResponse.filter((item) => item.id !== productResponse.id).slice(0, 4));
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setError(requestError instanceof Error ? requestError.message : 'Unable to load product.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const addToCart = async () => {
    if (!product || product.stock <= 0 || isAdding) return;

    if (!isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent(`/product/${product.id}`)}`);
      return;
    }

    setIsAdding(true);
    setNotice('');

    try {
      await addApiCartItem(product.id, quantity, selectedSize);
      addLocalCartItem({
        id: `${product.id}-${selectedSize}`,
        productId: product.id,
        name: product.name,
        category: 'CoTee Product',
        price: product.price / 100,
        image: product.imageUrl ?? '',
        size: selectedSize,
        color: '#ff9429',
        quantity,
      });
      setNotice(`${quantity} ${product.name} added to cart.`);
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : 'Unable to add product to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-[#e2e8f0]" />
          <div className="space-y-5 py-8">
            <div className="h-10 w-2/3 animate-pulse rounded bg-[#e2e8f0]" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-[#f1f5f9]" />
            <div className="h-24 animate-pulse rounded bg-[#f1f5f9]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#0f172a]">Product unavailable</h1>
        <p className="mt-3 text-[#64748b]">{error || 'The requested product could not be found.'}</p>
        <Link to="/browse" className="mt-6 inline-flex rounded-xl bg-[#ff9429] px-6 py-3 font-bold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="border-b border-[#f1f5f9] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/browse" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#ff9429]">
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <div className="aspect-square overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8f7f5]">
            <ProductImage product={product} className="h-full w-full object-cover" />
          </div>

          <div className="h-fit rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              product.stock > 0 ? 'bg-[#f0fdf4] text-[#15803d]' : 'bg-[#fef2f2] text-[#b91c1c]'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-[#0f172a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {product.name}
            </h1>
            <p className="mt-5 text-4xl font-bold text-[#0f172a]">{formatPrice(product.price)}</p>

            <div className="mt-8">
              <h2 className="mb-3 text-sm font-bold uppercase text-[#0f172a]">Size</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 rounded-lg border text-sm font-bold ${
                      selectedSize === size
                        ? 'border-[#ff9429] bg-[#fff5eb] text-[#ff9429]'
                        : 'border-[#e2e8f0] text-[#0f172a] hover:border-[#ffa62b]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="mb-3 text-sm font-bold uppercase text-[#0f172a]">Quantity</h2>
              <div className="inline-grid h-11 grid-cols-[44px_56px_44px] overflow-hidden rounded-lg border border-[#e2e8f0]">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="grid place-items-center hover:bg-[#f8f7f5]" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <div className="grid place-items-center border-x border-[#e2e8f0] text-sm font-bold">{quantity}</div>
                <button type="button" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} className="grid place-items-center hover:bg-[#f8f7f5]" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-[1fr_52px] gap-3">
              <button
                type="button"
                onClick={addToCart}
                disabled={product.stock <= 0 || isAdding}
                className="inline-flex h-13 items-center justify-center gap-3 rounded-xl bg-[#ff9429] px-6 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-5 w-5" />
                {isAdding ? 'Adding...' : 'Add to cart'}
              </button>
              <button
                type="button"
                onClick={() => setIsWishlisted((current) => !current)}
                className="grid h-13 place-items-center rounded-xl border border-[#e2e8f0] text-[#ff9429] hover:border-[#ffa62b]"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {notice && <div className="mt-4 rounded-xl bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#c2410c]">{notice}</div>}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-[#e2e8f0] bg-white py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#0f172a]">More products</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`} className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white transition-colors hover:border-[#ffa62b]">
                  <div className="aspect-square">
                    <ProductImage product={relatedProduct} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#0f172a]">{relatedProduct.name}</h3>
                    <p className="mt-1 text-sm text-[#64748b]">{formatPrice(relatedProduct.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
