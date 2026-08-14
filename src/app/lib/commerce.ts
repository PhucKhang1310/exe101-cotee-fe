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

export function createImageThumbnailDataUrl(imageUrl: string, size = 420): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Unable to create image thumbnail.'));
        return;
      }

      const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, size, size);
      context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => reject(new Error('Unable to load image thumbnail source.'));
    image.src = imageUrl;
  });
}
