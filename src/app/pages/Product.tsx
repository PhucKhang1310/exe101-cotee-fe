import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { addCartItem as addApiCartItem, getProduct, type ApiProduct } from '../lib/api';
import { addCartItem as addLocalCartItem, isAuthenticated } from '../lib/store';
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

const designs = [
  imgColorBlockTee,
  imgWhiteTee,
  imgPaintTee,
  imgHangerTee,
  imgBlackModelTee,
  imgOversizedTee,
  imgPocketTee,
  imgCatTee,
  imgRackTee,
  imgSunsetTee,
  imgTealSunsetTee,
  imgClassicWhiteTee,
];

const products = [
  {
    name: 'Color Block Tee',
    category: 'Premium T-Shirt',
    price: 28.95,
    originalPrice: 36,
    rating: 4.8,
    reviews: 214,
    palette: ['#0f172a', '#ff9429', '#f8f7f5', '#16a34a'],
    description:
      'A soft everyday tee with a bold color-block print, shown on a clean product mockup for easy inspection.',
  },
  {
    name: 'Essential White Tee',
    category: 'Classic T-Shirt',
    price: 24.5,
    originalPrice: 32,
    rating: 4.9,
    reviews: 168,
    palette: ['#ffffff', '#e5e7eb', '#94a3b8', '#0f172a'],
    description:
      'A clean blank tee mockup for creators who want a minimal base for custom artwork and print previews.',
  },
  {
    name: 'Paint Mark Tee',
    category: 'Graphic T-Shirt',
    price: 29.75,
    originalPrice: 38,
    rating: 4.7,
    reviews: 96,
    palette: ['#ffffff', '#ef4444', '#f97316', '#64748b'],
    description:
      'A white tee with a compact abstract graphic, photographed as a realistic apparel product preview.',
  },
  {
    name: 'Minimal Hanger Tee',
    category: 'Classic T-Shirt',
    price: 27.25,
    originalPrice: 35,
    rating: 4.6,
    reviews: 143,
    palette: ['#ffffff', '#f8f7f5', '#94a3b8', '#0f172a'],
    description:
      'A minimal hanging tee product shot with a light graphic, ideal for clean storefront previews.',
  },
  {
    name: 'Black Studio Tee',
    category: 'Premium T-Shirt',
    price: 34.5,
    originalPrice: 44,
    rating: 4.8,
    reviews: 287,
    palette: ['#111827', '#374151', '#f8f7f5', '#ff9429'],
    description:
      'A premium black tee shown on-model, made for high-contrast artwork and streetwear-inspired collections.',
  },
  {
    name: 'Oversized Graphic Tee',
    category: 'Oversized T-Shirt',
    price: 38.95,
    originalPrice: 48,
    rating: 4.5,
    reviews: 78,
    palette: ['#0f172a', '#1f2937', '#e5e7eb', '#64748b'],
    description:
      'An oversized black graphic tee with a relaxed silhouette and bold front artwork presentation.',
  },
  {
    name: 'Heather Pocket Tee',
    category: 'Pocket T-Shirt',
    price: 31.75,
    originalPrice: 40,
    rating: 4.9,
    reviews: 332,
    palette: ['#cbd5e1', '#94a3b8', '#64748b', '#f8f7f5'],
    description:
      'A heather gray pocket tee mockup with subtle texture, suited for understated everyday designs.',
  },
  {
    name: 'Cat Glow Tee',
    category: 'Graphic T-Shirt',
    price: 35.4,
    originalPrice: 46,
    rating: 4.4,
    reviews: 51,
    palette: ['#0f172a', '#14b8a6', '#22d3ee', '#e5e7eb'],
    description:
      'A black graphic tee with a luminous cat illustration, presented as a finished product concept.',
  },
  {
    name: 'Rack Display Tee',
    category: 'Mockup T-Shirt',
    price: 28.2,
    originalPrice: 36,
    rating: 4.7,
    reviews: 119,
    palette: ['#e5e7eb', '#94a3b8', '#f8f7f5', '#64748b'],
    description:
      'A neutral tee displayed on a clothing rack, useful for simple catalog-style product presentation.',
  },
  {
    name: 'Cream Sunset Tee',
    category: 'Graphic T-Shirt',
    price: 33.25,
    originalPrice: 42,
    rating: 4.6,
    reviews: 87,
    palette: ['#fff7ed', '#fb923c', '#0f766e', '#f8f7f5'],
    description:
      'A cream tee with a warm sunset graphic, styled as a lifestyle-ready apparel product.',
  },
  {
    name: 'Teal Sunset Tee',
    category: 'Graphic T-Shirt',
    price: 34.2,
    originalPrice: 43,
    rating: 4.9,
    reviews: 241,
    palette: ['#164e63', '#fb923c', '#fde68a', '#e5e7eb'],
    description:
      'A teal graphic tee with layered sunset stripes, perfect for casual collections and print-on-demand previews.',
  },
  {
    name: 'Classic Mockup Tee',
    category: 'Mockup T-Shirt',
    price: 26.5,
    originalPrice: 34,
    rating: 4.3,
    reviews: 42,
    palette: ['#ffffff', '#e5e7eb', '#cbd5e1', '#0f172a'],
    description:
      'A crisp white T-shirt mockup with soft shadows, designed for clear product inspection and customization.',
  },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const related = designs.slice(1, 5);

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericProductId = Number(id ?? 1);
  const productId = Number.isFinite(numericProductId) ? numericProductId : 1;
  const normalizedProductId = ((Math.max(productId, 1) - 1) % products.length) + 1;
  const fallbackProduct = products[normalizedProductId - 1];
  const fallbackHeroImage = designs[normalizedProductId - 1];
  const [backendProduct, setBackendProduct] = useState<ApiProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState(fallbackHeroImage);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(2);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [productNotice, setProductNotice] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const product = backendProduct
    ? {
        name: backendProduct.name,
        category: 'Premium T-Shirt',
        price: backendProduct.price,
        originalPrice: backendProduct.price,
        rating: fallbackProduct.rating,
        reviews: fallbackProduct.reviews,
        palette: fallbackProduct.palette,
        description: `${backendProduct.name} is available from the CoTee product catalog.`,
      }
    : fallbackProduct;
  const heroImage = backendProduct?.imageUrl || fallbackHeroImage;
  const gallery = [heroImage, ...designs.filter((image) => image !== heroImage).slice(0, 3)];
  const cartProductId = backendProduct?.id ?? String(normalizedProductId);
  const canUseBackendCart = Boolean(backendProduct?.id);

  useEffect(() => {
    if (!id || /^\d+$/.test(id)) return;

    let isMounted = true;
    getProduct(id)
      .then((productResponse) => {
        if (!isMounted) return;
        setBackendProduct(productResponse);
        setSelectedImage(productResponse.imageUrl || fallbackHeroImage);
        setProductNotice('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setProductNotice(error instanceof Error ? error.message : 'Unable to load product from backend.');
      });

    return () => {
      isMounted = false;
    };
  }, [fallbackHeroImage, id]);

  const addToCart = async () => {
    if (!isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent(`/product/${id ?? normalizedProductId}`)}`);
      return;
    }

    try {
      if (canUseBackendCart) {
        await addApiCartItem(cartProductId, quantity, sizes[selectedSize]);
      }

      addLocalCartItem({
        id: `${cartProductId}-${sizes[selectedSize]}-${selectedColor}`,
        productId: cartProductId,
        name: product.name,
        category: product.category,
        price: product.price,
        image: heroImage,
        size: sizes[selectedSize],
        color: product.palette[selectedColor],
        quantity,
      });
      setCartMessage(`${quantity} ${product.name} in ${sizes[selectedSize]} added to cart`);
    } catch (error) {
      setCartMessage(error instanceof Error ? error.message : 'Unable to add this item to cart.');
    }
  };

  return (
    <div className="w-full">
      <section className="bg-white border-b border-[#f1f5f9]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/browse" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#ff9429]">
            <ArrowLeft className="w-4 h-4" />
            Back to designs
          </Link>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {productNotice && (
          <div className="mb-6 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#c2410c]">
            Using local product preview because the backend product could not be loaded: {productNotice}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-[#f8f7f5] rounded-2xl overflow-hidden border border-[#e2e8f0]">
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 bg-white ${
                    selectedImage === image ? 'border-[#ff9429]' : 'border-[#e2e8f0] hover:border-[#ffa62b]'
                  }`}
                  aria-label={`View ${product.name} image ${index + 1}`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 sm:p-7 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff5eb] px-3 py-1 text-sm font-semibold text-[#ff9429]">
                  <Sparkles className="w-4 h-4" />
                  AI generated
                </span>
                <span className="text-sm font-medium text-[#64748b]">{product.category}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#0f172a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 text-[#f59e0b]">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#0f172a]">{product.rating}</span>
                <span className="text-sm text-[#64748b]">{product.reviews} reviews</span>
              </div>

              <p className="mt-5 text-base leading-7 text-[#64748b]">{product.description}</p>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-4xl font-bold text-[#0f172a]">${product.price.toFixed(2)}</span>
                <span className="pb-1 text-lg text-[#94a3b8] line-through">${product.originalPrice.toFixed(2)}</span>
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-[#0f172a]">Color</h2>
                    <span className="text-sm text-[#64748b]">4 print accents</span>
                  </div>
                  <div className="flex gap-3">
                    {product.palette.map((color, index) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(index)}
                        className={`h-10 w-10 rounded-full border-2 ${selectedColor === index ? 'border-[#0f172a]' : 'border-white'} shadow ring-1 ring-[#e2e8f0]`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-[#0f172a]">Size</h2>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide((current) => !current)}
                      className="text-sm font-semibold text-[#ff9429] hover:text-[#ff8c1a]"
                    >
                      Size guide
                    </button>
                  </div>
                  {showSizeGuide && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8f7f5] text-sm">
                      <div className="grid grid-cols-4 bg-white px-3 py-2 font-bold text-[#0f172a]">
                        <span>Size</span>
                        <span>Chest</span>
                        <span>Length</span>
                        <span>Fit</span>
                      </div>
                      {[
                        ['XS', '34-36"', '26"', 'Slim'],
                        ['S', '36-38"', '27"', 'Regular'],
                        ['M', '38-40"', '28"', 'Regular'],
                        ['L', '41-43"', '29"', 'Relaxed'],
                        ['XL', '44-46"', '30"', 'Relaxed'],
                        ['2XL', '47-50"', '31"', 'Roomy'],
                      ].map((row) => (
                        <div key={row[0]} className="grid grid-cols-4 border-t border-[#e2e8f0] px-3 py-2 text-[#64748b]">
                          {row.map((cell) => (
                            <span key={cell}>{cell}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {sizes.map((size, index) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(index)}
                        className={`h-11 rounded-lg border text-sm font-bold transition-colors ${
                          selectedSize === index
                            ? 'border-[#ff9429] bg-[#fff5eb] text-[#ff9429]'
                            : 'border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#ffa62b]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0f172a]">Quantity</h2>
                  <div className="inline-grid grid-cols-[44px_56px_44px] h-11 overflow-hidden rounded-lg border border-[#e2e8f0] bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="grid place-items-center text-[#64748b] hover:bg-[#f8f7f5]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="grid place-items-center border-x border-[#e2e8f0] text-sm font-bold text-[#0f172a]">{quantity}</div>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      className="grid place-items-center text-[#64748b] hover:bg-[#f8f7f5]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-[1fr_52px] gap-3">
                <button
                  type="button"
                  onClick={addToCart}
                  className="inline-flex h-13 items-center justify-center gap-3 rounded-xl bg-[#ff9429] px-6 font-bold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-[#ff8c1a]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => setIsWishlisted((current) => !current)}
                  className="grid h-13 place-items-center rounded-xl border border-[#e2e8f0] bg-white text-[#ff9429] hover:border-[#ffa62b] hover:bg-[#fff5eb]"
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {cartMessage && (
                <div className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#166534]">
                  {cartMessage}.{' '}
                  <Link to="/cart" className="underline hover:text-[#14532d]">
                    View cart
                  </Link>
                </div>
              )}

              <div className="mt-6 grid gap-3 text-sm text-[#475569]">
                {[
                  [Truck, 'Ships in 3-5 business days'],
                  [ShieldCheck, 'Secure checkout and quality guarantee'],
                  [RotateCcw, 'Free returns within 14 days'],
                ].map(([Icon, text]) => (
                  <div key={text as string} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#ff9429]" />
                    <span>{text as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              ['Print-ready detail', '300 DPI artwork is prepared for clean apparel production.'],
              ['Soft premium blanks', 'Comfortable cotton blend with a retail fit and sturdy collar.'],
              ['Creator ownership', 'Keep your design in your CoTee library for future edits.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-[#e2e8f0] bg-[#f8f7f5] p-5">
                <div className="mb-3 inline-grid h-9 w-9 place-items-center rounded-lg bg-[#fff5eb] text-[#ff9429]">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#0f172a]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#64748b]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#0f172a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>More designs</h2>
            <p className="mt-1 text-[#64748b]">Fresh picks from the same creative set</p>
          </div>
          <Link to="/browse" className="hidden sm:inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f172a] border border-[#e2e8f0] hover:border-[#ffa62b]">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {related.map((image, index) => (
            <Link key={image} to={`/product/${index + 2}`} className="group rounded-2xl bg-white border border-[#e2e8f0] overflow-hidden hover:border-[#ffa62b] hover:shadow-lg transition-all">
              <div className="aspect-square bg-[#f8f7f5] overflow-hidden">
                <img src={image} alt={`Related design ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#0f172a] group-hover:text-[#ff9429]">Design #{index + 2}</h3>
                <p className="mt-1 text-sm text-[#64748b]">${(24 + index * 4.5).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
