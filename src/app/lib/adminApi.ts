import { request, type ApiOrder, type ApiOrderItem, type ApiProduct } from './api';

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PagedUsers = {
  page: number;
  pageSize: number;
  total: number;
  items: AdminUser[];
};

export type OrderItem = ApiOrderItem;
export type AdminOrder = ApiOrder;

export function getAdminProductSummaries(): Promise<ApiProduct[]> {
  return request('/api/Products/admin-summary');
}

export function getAdminUsers(page = 1, pageSize = 100): Promise<PagedUsers> {
  return request(`/api/admin/users?page=${page}&pageSize=${pageSize}`);
}

export function createAdminUser(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AdminUser> {
  return request('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateAdminUser(
  id: string,
  payload: { fullName?: string; role?: string },
): Promise<AdminUser> {
  return request(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function toggleAdminUserStatus(id: string): Promise<AdminUser> {
  return request(`/api/admin/users/${encodeURIComponent(id)}/toggle-status`, { method: 'PUT' });
}

export function deleteAdminUser(id: string): Promise<void> {
  return request(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function createProduct(payload: {
  name: string;
  imageUrl?: string;
  price: number;
  stock: number;
}): Promise<ApiProduct> {
  return request('/api/Products', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateProduct(
  id: string,
  payload: { name?: string; imageUrl?: string; price?: number; stock?: number },
): Promise<ApiProduct> {
  return request(`/api/Products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id: string): Promise<void> {
  return request(`/api/Products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getAdminOrders(): Promise<AdminOrder[]> {
  return request('/api/Orders/admin');
}

export function updateOrderStatus(
  orderCode: string,
  payload: { orderStatus?: string; paymentStatus?: string },
): Promise<AdminOrder> {
  return request(`/api/Orders/${encodeURIComponent(orderCode)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function cancelOrder(orderCode: string): Promise<AdminOrder> {
  return request(`/api/Orders/${encodeURIComponent(orderCode)}/cancel`, { method: 'POST' });
}
