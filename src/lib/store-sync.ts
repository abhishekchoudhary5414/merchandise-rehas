export interface CartItem {
  productId: string;
  id?: string;
  name: string;
  slug: string;
  image: string;
  tier?: string;
  ritual?: boolean;
  wristSize?: string;
  unitPrice: number;
  price?: number;
  quantity: number;
  inStock?: boolean;
  maxStock?: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

const CART_KEY = 'rehas_cart';
const WISHLIST_KEY = 'rehas_wishlist';
const CART_EVENT = 'rehas_cart_updated';
const WISHLIST_EVENT = 'rehas_wishlist_updated';

let activeSyncPromise: Promise<void> | null = null;

function readStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage<T>(key: string, eventName: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event(eventName));
  } catch {
    // Ignore storage quota / private mode errors
  }
}

async function pushToServer(endpoint: string, method: 'PUT' | 'POST', items: unknown[]): Promise<unknown[] | null> {
  try {
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : null;
  } catch {
    return null;
  }
}

export function getCart(): CartItem[] {
  return readStorage<CartItem>(CART_KEY);
}

export function setCart(items: CartItem[], syncToServer = true): void {
  writeStorage(CART_KEY, CART_EVENT, items);
  if (syncToServer && typeof window !== 'undefined') {
    void pushToServer('/api/cart', 'PUT', items);
  }
}

export function addToCart(newItem: CartItem): CartItem[] {
  const existing = getCart();
  const matchIdx = existing.findIndex(
    (c) =>
      (c.productId === newItem.productId || c.id === newItem.productId || c.slug === newItem.slug) &&
      (c.tier || 'root') === (newItem.tier || 'root') &&
      Boolean(c.ritual) === Boolean(newItem.ritual) &&
      (c.wristSize || '') === (newItem.wristSize || '')
  );

  const next = [...existing];
  const addQty = Math.max(1, Number(newItem.quantity) || 1);

  if (matchIdx >= 0) {
    next[matchIdx] = {
      ...next[matchIdx],
      unitPrice: newItem.unitPrice,
      price: newItem.unitPrice,
      quantity: (Number(next[matchIdx].quantity) || 1) + addQty,
    };
  } else {
    next.push({ ...newItem, quantity: addQty, price: newItem.unitPrice });
  }

  setCart(next, true);
  return next;
}

export function clearCart(syncToServer = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event(CART_EVENT));
  } catch {
    // Ignore
  }
  if (syncToServer) {
    void fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
  }
}

export function getWishlist(): WishlistItem[] {
  return readStorage<WishlistItem>(WISHLIST_KEY);
}

export function setWishlist(items: WishlistItem[], syncToServer = true): void {
  writeStorage(WISHLIST_KEY, WISHLIST_EVENT, items);
  if (syncToServer && typeof window !== 'undefined') {
    void pushToServer('/api/wishlist', 'PUT', items);
  }
}

export function isInWishlist(idOrSlug: string): boolean {
  return getWishlist().some((item) => item.id === idOrSlug || item.slug === idOrSlug);
}

export function toggleWishlistItem(item: WishlistItem): { wishlisted: boolean; items: WishlistItem[] } {
  const existing = getWishlist();
  const exists = existing.some((w) => w.id === item.id || w.slug === item.slug);
  const next = exists
    ? existing.filter((w) => w.id !== item.id && w.slug !== item.slug)
    : [...existing, item];

  setWishlist(next, true);
  return { wishlisted: !exists, items: next };
}

export function removeFromWishlist(id: string): WishlistItem[] {
  const next = getWishlist().filter((w) => w.id !== id && w.slug !== id);
  setWishlist(next, true);
  return next;
}

/**
 * Syncs localStorage with the authenticated user's DB cart & wishlist.
 * Safe to call on mount across any page; deduplicates concurrent requests.
 */
export async function syncStoreFromServer(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (activeSyncPromise) return activeSyncPromise;

  activeSyncPromise = (async () => {
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        fetch('/api/cart', { cache: 'no-store' }),
        fetch('/api/wishlist', { cache: 'no-store' }),
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (cartData?.authenticated && Array.isArray(cartData.items)) {
          writeStorage(CART_KEY, CART_EVENT, cartData.items);
        }
      }

      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        if (wishlistData?.authenticated && Array.isArray(wishlistData.items)) {
          writeStorage(WISHLIST_KEY, WISHLIST_EVENT, wishlistData.items);
        }
      }
    } catch {
      // Non-fatal network error
    } finally {
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
}

/**
 * Merges any guest localStorage cart & wishlist items into the user's DB account
 * right after login or registration, then updates localStorage with the merged result.
 */
export async function mergeLocalStoreWithServer(): Promise<void> {
  if (typeof window === 'undefined') return;
  const localCart = getCart();
  const localWishlist = getWishlist();

  const [mergedCart, mergedWishlist] = await Promise.all([
    pushToServer('/api/cart', 'POST', localCart),
    pushToServer('/api/wishlist', 'POST', localWishlist),
  ]);

  if (Array.isArray(mergedCart)) {
    writeStorage(CART_KEY, CART_EVENT, mergedCart as CartItem[]);
  }
  if (Array.isArray(mergedWishlist)) {
    writeStorage(WISHLIST_KEY, WISHLIST_EVENT, mergedWishlist as WishlistItem[]);
  }
}

/**
 * Clears local cart & wishlist on logout so another user on the same device
 * does not inherit the previous user's local cache.
 */
export function clearLocalStoreOnLogout(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(WISHLIST_KEY);
    window.dispatchEvent(new Event(CART_EVENT));
    window.dispatchEvent(new Event(WISHLIST_EVENT));
  } catch {
    // Ignore
  }
}
