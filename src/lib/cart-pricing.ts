export interface PriceableProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  rootPrice: number | null;
  auraPrice: number | null;
  divinePrice: number | null;
  energyRitualPrice: number | null;
  primaryImage: string;
  inStock: boolean;
  stockQuantity: number;
}

export function computeUnitPrice(
  product: Pick<PriceableProduct, 'price' | 'rootPrice' | 'auraPrice' | 'divinePrice' | 'energyRitualPrice'>,
  tier?: string | null,
  ritual?: boolean
): number {
  const normalizedTier = (tier || 'root').toLowerCase();
  let basePrice = product.price;

  if (normalizedTier === 'aura' && product.auraPrice != null) {
    basePrice = product.auraPrice;
  } else if (normalizedTier === 'divine' && product.divinePrice != null) {
    basePrice = product.divinePrice;
  } else if (product.rootPrice != null) {
    basePrice = product.rootPrice;
  }

  const ritualAddon = ritual ? product.energyRitualPrice || 150 : 0;
  return basePrice + ritualAddon;
}

const TIER_SEPARATOR = '|tier:';

export function encodeWristSizeAndTier(wristSize?: string | null, tier?: string | null): string | null {
  const cleanSize = (wristSize || '').trim();
  const cleanTier = (tier || '').trim().toLowerCase();
  if (!cleanTier || cleanTier === 'root') {
    return cleanSize || null;
  }
  return `${cleanSize}${TIER_SEPARATOR}${cleanTier}`;
}

export function decodeWristSizeAndTier(raw?: string | null): { wristSize?: string; tier: string } {
  if (!raw) return { wristSize: undefined, tier: 'root' };
  const idx = raw.indexOf(TIER_SEPARATOR);
  if (idx === -1) {
    return { wristSize: raw || undefined, tier: 'root' };
  }
  const size = raw.slice(0, idx).trim();
  const tier = raw.slice(idx + TIER_SEPARATOR.length).trim() || 'root';
  return { wristSize: size || undefined, tier };
}
