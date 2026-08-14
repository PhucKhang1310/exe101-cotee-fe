export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.cotee.xyz'
).replace(/\/$/, '');

const TOKEN_KEY = 'cotee_auth_token';

export type ApiProduct = {
  id: string;
  name: string;
  imageUrl?: string | null;
  price: number;
  stock: number;
};

export type ApiCartItem = {
  productId: string;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size: string;
};

export type ApiUser = {
  id?: string;
  email?: string;
  fullName?: string;
  role?: string;
};

export type LoginResponse = {
  token?: string;
  user?: ApiUser;
  message?: string;
};

type RegisterResponse = {
  message?: string;
  email?: string;
  isEmailVerified: boolean;
};

type VerifyEmailResponse = {
  message?: string;
  email?: string;
  fullName?: string;
  isEmailVerified: boolean;
};

type ResendVerificationResponse = {
  message?: string;
};

export type CheckoutResponse = {
  orderCode: string;
  payUrl: string;
  totalAmount: number;
};

export type ApiOrderItem = {
  productId: string;
  name: string;
  priceAtPurchase: number;
  quantity: number;
  size: string;
};

export type ApiOrder = {
  id: string;
  userId: string;
  orderCode: string;
  shippingDetails: {
    fullName: string;
    phone: string;
    address: string;
  };
  items: ApiOrderItem[];
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

export function getAuthToken(): string {
  return window.localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function request<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options.headers);
  const token = getAuthToken();

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === 'string') {
        message = errorBody.message;
      }
    } catch {
      // Keep the status message if the backend does not return JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/Auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function googleLogin(idToken: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/Auth/google-login', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function register(fullName: string, email: string, password: string): Promise<RegisterResponse> {
  return request<RegisterResponse>('/api/Auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  });
}

export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  return request<VerifyEmailResponse>(`/api/Auth/verify-email?token=${encodeURIComponent(token)}`);
}

export async function resendVerification(email: string): Promise<ResendVerificationResponse> {
  return request<ResendVerificationResponse>('/api/Auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function logout(): Promise<void> {
  await request('/api/Auth/logout', { method: 'POST' });
}

export async function getProducts(): Promise<ApiProduct[]> {
  return request<ApiProduct[]>('/api/Products');
}

export async function getProduct(id: string): Promise<ApiProduct> {
  return request<ApiProduct>(`/api/Products/${encodeURIComponent(id)}`);
}

export async function createProduct(name: string, price: number, stock: number, imageUrl?: string): Promise<ApiProduct> {
  return request<ApiProduct>('/api/Products', {
    method: 'POST',
    body: JSON.stringify({ name, price, stock, imageUrl }),
  });
}

export async function getCart(): Promise<ApiCartItem[]> {
  return request<ApiCartItem[]>('/api/Carts');
}

export async function addCartItem(productId: string, quantity: number, size: string): Promise<ApiCartItem[]> {
  return request<ApiCartItem[]>('/api/Carts/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, size }),
  });
}

export async function updateCartItem(productId: string, quantity: number, size: string): Promise<ApiCartItem[]> {
  return request<ApiCartItem[]>('/api/Carts/items', {
    method: 'PUT',
    body: JSON.stringify({ productId, quantity, size }),
  });
}

export async function removeCartItem(productId: string, size: string): Promise<ApiCartItem[]> {
  return request<ApiCartItem[]>(`/api/Carts/items/${encodeURIComponent(productId)}?size=${encodeURIComponent(size)}`, {
    method: 'DELETE',
  });
}

export async function clearCart(): Promise<void> {
  await request('/api/Carts', { method: 'DELETE' });
}

export async function checkout(fullName: string, phone: string, address: string): Promise<CheckoutResponse> {
  return request<CheckoutResponse>('/api/Orders/checkout', {
    method: 'POST',
    body: JSON.stringify({ fullName, phone, address }),
  });
}

export async function getMyOrders(): Promise<ApiOrder[]> {
  return request<ApiOrder[]>('/api/Orders/my-orders');
}

export async function cancelOrder(orderCode: string): Promise<ApiOrder> {
  return request<ApiOrder>(`/api/Orders/${encodeURIComponent(orderCode)}/cancel`, { method: 'POST' });
}
