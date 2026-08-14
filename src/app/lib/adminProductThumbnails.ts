const INLINE_THUMBNAILS_LS_KEY = 'cotee_admin_product_inline_thumbnails';

export function loadAdminProductThumbnails(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(INLINE_THUMBNAILS_LS_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveAdminProductThumbnails(thumbnails: Record<string, string>) {
  try {
    window.localStorage.setItem(INLINE_THUMBNAILS_LS_KEY, JSON.stringify(thumbnails));
  } catch {
    // Thumbnails can be regenerated if browser storage is unavailable.
  }
}
