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

export function getProductImageThumbnail(imageUrl: string, size = 360): string {
  if (!imageUrl) return '';

  const uploadMarker = '/image/upload/';
  const uploadIndex = imageUrl.indexOf(uploadMarker);
  if (uploadIndex < 0) return imageUrl;

  const transformation = `f_auto,q_auto,c_fill,g_auto,w_${size},h_${size}`;
  const prefix = imageUrl.slice(0, uploadIndex + uploadMarker.length);
  const path = imageUrl.slice(uploadIndex + uploadMarker.length);
  const segments = path.split('/');
  const firstSegment = segments[0] ?? '';
  const firstSegmentLooksLikeTransformation =
    firstSegment.includes(',') || firstSegment.startsWith('t_') || /^[a-z]_[^/]+$/.test(firstSegment);
  const publicPath = firstSegmentLooksLikeTransformation && segments.length > 1
    ? segments.slice(1).join('/')
    : path;

  return `${prefix}${transformation}/${publicPath}`;
}
