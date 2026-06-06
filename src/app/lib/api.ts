export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://exe201-cotee-be-production.up.railway.app'
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

type ApiUser = {
  email?: string;
  fullName?: string;
};

type LoginResponse = {
  token?: string;
  user?: ApiUser;
  message?: string;
};

type RegisterResponse = {
  message?: string;
  email?: string;
  verificationUrl?: string;
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

async function request<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
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

export async function register(fullName: string, email: string, password: string): Promise<RegisterResponse> {
  return request<RegisterResponse>('/api/Auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
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
