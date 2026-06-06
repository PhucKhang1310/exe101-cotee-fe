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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setCartItems(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
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
