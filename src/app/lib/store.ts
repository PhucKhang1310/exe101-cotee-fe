import { clearAuthToken, setAuthToken } from './api';

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

const AUTH_KEY = 'cotee_auth_user';
const CART_KEY = 'cotee_cart_items';
const MAX_CART_IMAGE_LENGTH = 2048;

function normalizeCartItem(item: CartItem): CartItem {
  return {
    id: String(item.id),
    productId: String(item.productId),
    name: String(item.name),
    category: String(item.category),
    price: Number(item.price) || 0,
    image:
      typeof item.image === 'string' &&
      !item.image.startsWith('data:') &&
      item.image.length <= MAX_CART_IMAGE_LENGTH
        ? item.image
        : '',
    size: String(item.size),
    color: String(item.color || '#315fae'),
    quantity: Number(item.quantity) || 1,
  };
}

export function getAuthUser(): string {
  return window.localStorage.getItem(AUTH_KEY) ?? '';
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthUser());
}

export function signIn(email: string) {
  window.localStorage.setItem(AUTH_KEY, email);
  window.dispatchEvent(new Event('cotee-auth-change'));
}

export function signInWithToken(email: string, token: string) {
  setAuthToken(token);
  signIn(email);
}

export function signOut() {
  window.localStorage.removeItem(AUTH_KEY);
  clearAuthToken();
  window.dispatchEvent(new Event('cotee-auth-change'));
}

export function getCartItems(): CartItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
  } catch {
    window.localStorage.removeItem(CART_KEY);
    return [];
  }
}

export function setCartItems(items: CartItem[]) {
  const normalizedItems = items.map(normalizeCartItem);

  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(normalizedItems));
  } catch (error) {
    console.warn('Unable to persist local cart.', error);
  }

  window.dispatchEvent(new Event('cotee-cart-change'));
}

export function addCartItem(item: CartItem) {
  const items = getCartItems();
  const existingIndex = items.findIndex(
    (cartItem) =>
      cartItem.productId === item.productId &&
      cartItem.size === item.size &&
      cartItem.color === item.color,
  );

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + item.quantity,
    };
    setCartItems(items);
    return;
  }

  setCartItems([...items, item]);
}
