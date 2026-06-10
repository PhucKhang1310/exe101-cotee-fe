import { frontMockupOptions } from './cloudinaryMockups';

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function formatVnd(amount: number): string {
  return vndFormatter.format(amount);
}

export function getTeeProductImage(productId: string): string {
  const hash = [...productId].reduce((total, character) => total + character.charCodeAt(0), 0);
  return frontMockupOptions[hash % frontMockupOptions.length]?.src ?? '';
}
