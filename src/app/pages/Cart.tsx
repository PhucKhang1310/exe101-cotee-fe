import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import {
  clearCart as clearApiCart,
  getCart,
  removeCartItem as removeApiCartItem,
  updateCartItem as updateApiCartItem,
  type ApiCartItem,
} from '../lib/api';
import { type CartItem, getCartItems, isAuthenticated, setCartItems } from '../lib/store';

function mapApiCartItem(item: ApiCartItem): CartItem {
  return {
    id: `${item.productId}-${item.size}`,
    productId: item.productId,
    name: item.productName,
    category: 'CoTee Product',
    price: item.price,
    image: item.imageUrl,
    size: item.size,
    color: '#ff9429',
    quantity: item.quantity,
  };
}

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent('/cart')}`);
      return;
    }

    getCart()
      .then((cartItems) => {
        const mappedItems = cartItems.map(mapApiCartItem);
        setItems(mappedItems);
        setCartItems(mappedItems);
        setNotice('');
      })
      .catch((error) => {
        setItems(getCartItems());
        setNotice(error instanceof Error ? `Using local cart because the backend cart could not be loaded: ${error.message}` : 'Using local cart.');
      });
  }, [navigate]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const shipping = items.length > 0 ? 4.95 : 0;
  const total = subtotal + shipping;

  const updateItems = (nextItems: CartItem[]) => {
    setItems(nextItems);
    setCartItems(nextItems);
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const nextQuantity = Math.max(1, quantity);
    const item = items.find((cartItem) => cartItem.id === id);
    if (!item) return;

    updateItems(
      items.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity: nextQuantity } : cartItem,
      ),
    );

    try {
      const cartItems = await updateApiCartItem(item.productId, nextQuantity, item.size);
      updateItems(cartItems.map(mapApiCartItem));
      setNotice('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to update backend cart.');
    }
  };

  const removeItem = async (id: string) => {
    const item = items.find((cartItem) => cartItem.id === id);
    updateItems(items.filter((cartItem) => cartItem.id !== id));
    if (!item) return;

    try {
      const cartItems = await removeApiCartItem(item.productId, item.size);
      updateItems(cartItems.map(mapApiCartItem));
      setNotice('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to remove item from backend cart.');
    }
  };

  const clearCart = async () => {
    updateItems([]);
    try {
      await clearApiCart();
      setNotice('Cart cleared.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Cart cleared locally, but backend clear failed.');
    }
  };

  const checkout = () => {
    if (items.length === 0) {
      setNotice('Add at least one item before checkout.');
      return;
    }

    setNotice('Checkout is ready to connect to a payment provider.');
  };

  return (
    <div className="w-full py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-5xl font-bold text-[#0f172a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Your Cart
            </h1>
            <p className="mt-3 text-[#64748b]">Review selected apparel before checkout.</p>
          </div>
          <Link to="/browse" className="inline-flex items-center justify-center rounded-xl border border-[#e2e8f0] bg-white px-5 py-3 text-sm font-bold text-[#0f172a] hover:border-[#ffa62b]">
            Continue shopping
          </Link>
        </div>

        {notice && (
          <div className="mb-6 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#c2410c]">
            {notice}
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#fff5eb] text-[#ff9429]">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Your cart is empty</h2>
            <p className="mx-auto mt-3 max-w-md text-[#64748b]">
              Browse designs and add a product to start an order.
            </p>
            <Link to="/browse" className="mt-6 inline-flex rounded-xl bg-[#ff9429] px-6 py-3 font-bold text-white hover:bg-[#ff8c1a]">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[112px_minmax(0,1fr)] gap-5 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                  <div className="aspect-square overflow-hidden rounded-xl bg-[#f8f7f5]">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-bold text-[#0f172a]">{item.name}</h2>
                        <p className="mt-1 text-sm text-[#64748b]">{item.category}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#64748b]">
                          <span>Size {item.size}</span>
                          <span className="inline-flex items-center gap-2">
                            Color
                            <span className="h-4 w-4 rounded-full border border-[#e2e8f0]" style={{ backgroundColor: item.color }} />
                          </span>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-[#0f172a]">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="inline-grid h-10 grid-cols-[40px_48px_40px] overflow-hidden rounded-lg border border-[#e2e8f0] bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="grid place-items-center text-[#64748b] hover:bg-[#f8f7f5]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="grid place-items-center border-x border-[#e2e8f0] text-sm font-bold text-[#0f172a]">{item.quantity}</div>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid place-items-center text-[#64748b] hover:bg-[#f8f7f5]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#ef4444] hover:bg-[#fef2f2]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#0f172a]">Order summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-[#64748b]">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#64748b]">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#e2e8f0] pt-3 flex justify-between text-lg font-bold text-[#0f172a]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={checkout}
                className="mt-6 w-full rounded-xl bg-[#ff9429] px-6 py-4 font-bold text-white shadow-lg shadow-orange-200 hover:bg-[#ff8c1a]"
              >
                Checkout
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="mt-3 w-full rounded-xl border border-[#e2e8f0] bg-white px-6 py-3 font-bold text-[#0f172a] hover:border-[#ffa62b] hover:bg-[#fff5eb]"
              >
                Clear cart
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
