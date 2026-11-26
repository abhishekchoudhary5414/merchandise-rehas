import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerUser } from '@/lib/customer-auth';
import {
  computeUnitPrice,
  decodeWristSizeAndTier,
  encodeWristSizeAndTier,
} from '@/lib/cart-pricing';

interface IncomingCartItem {
  productId?: string;
  id?: string;
  slug?: string;
  quantity?: number;
  wristSize?: string | null;
  tier?: string | null;
  ritual?: boolean;
  energized?: boolean;
}

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  rootPrice: true,
  auraPrice: true,
  divinePrice: true,
  energyRitualPrice: true,
  primaryImage: true,
  inStock: true,
  stockQuantity: true,
} as const;

async function fetchHydratedCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { select: PRODUCT_SELECT } },
      },
    },
  });

  if (!cart) return [];

  return cart.items.map((item) => {
    const { wristSize, tier } = decodeWristSizeAndTier(item.wristSize);
    const ritual = Boolean(item.energized);
    const unitPrice = computeUnitPrice(item.product, tier, ritual);

    return {
      productId: item.productId,
      id: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.primaryImage,
      tier,
      ritual,
      wristSize,
      unitPrice,
      price: unitPrice,
      quantity: item.quantity,
      inStock: item.product.inStock,
      maxStock: item.product.stockQuantity,
    };
  });
}

async function resolveValidProductIds(items: IncomingCartItem[]): Promise<Map<string, string>> {
  const keys = items
    .map((it) => it.productId || it.id || it.slug)
    .filter((v): v is string => Boolean(v));

  if (keys.length === 0) return new Map();

  const products = await prisma.product.findMany({
    where: { OR: [{ id: { in: keys } }, { slug: { in: keys } }] },
    select: { id: true, slug: true },
  });

  const map = new Map<string, string>();
  for (const p of products) {
    map.set(p.id, p.id);
    map.set(p.slug, p.id);
  }
  return map;
}

function normalizeIncomingItems(items: IncomingCartItem[], productMap: Map<string, string>) {
  const merged = new Map<
    string,
    { productId: string; quantity: number; wristSize: string | null; energized: boolean }
  >();

  for (const raw of items) {
    const key = raw.productId || raw.id || raw.slug || '';
    const productId = productMap.get(key);
    if (!productId) continue;

    const qty = Math.max(1, Math.floor(Number(raw.quantity) || 1));
    const energized = Boolean(raw.ritual ?? raw.energized ?? false);
    const encodedSize = encodeWristSizeAndTier(raw.wristSize, raw.tier);
    const dedupeKey = `${productId}::${encodedSize || ''}::${energized}`;

    const existing = merged.get(dedupeKey);
    if (existing) {
      existing.quantity += qty;
    } else {
      merged.set(dedupeKey, {
        productId,
        quantity: qty,
        wristSize: encodedSize,
        energized,
      });
    }
  }

  return Array.from(merged.values());
}

export async function GET() {
  try {
    const user = await getCustomerUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, items: [] });
    }

    const items = await fetchHydratedCart(user.userId);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCustomerUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, items: [] }, { status: 401 });
    }

    const body = await req.json();
    const rawItems: IncomingCartItem[] = Array.isArray(body?.items) ? body.items : [];
    const productMap = await resolveValidProductIds(rawItems);
    const normalized = normalizeIncomingItems(rawItems, productMap);

    await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId: user.userId },
        update: {},
        create: { userId: user.userId },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (normalized.length > 0) {
        await tx.cartItem.createMany({
          data: normalized.map((item) => ({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
            wristSize: item.wristSize,
            energized: item.energized,
          })),
        });
      }
    });

    const items = await fetchHydratedCart(user.userId);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('PUT /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCustomerUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, items: [] }, { status: 401 });
    }

    const body = await req.json();
    const guestItems: IncomingCartItem[] = Array.isArray(body?.items) ? body.items : [];

    if (guestItems.length > 0) {
      const productMap = await resolveValidProductIds(guestItems);
      const normalizedGuest = normalizeIncomingItems(guestItems, productMap);

      if (normalizedGuest.length > 0) {
        await prisma.$transaction(async (tx) => {
          const cart = await tx.cart.upsert({
            where: { userId: user.userId },
            update: {},
            create: { userId: user.userId },
            include: { items: true },
          });

          for (const g of normalizedGuest) {
            const existing = cart.items.find(
              (c) =>
                c.productId === g.productId &&
                (c.wristSize || null) === g.wristSize &&
                c.energized === g.energized
            );

            if (existing) {
              await tx.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + g.quantity },
              });
            } else {
              await tx.cartItem.create({
                data: {
                  cartId: cart.id,
                  productId: g.productId,
                  quantity: g.quantity,
                  wristSize: g.wristSize,
                  energized: g.energized,
                },
              });
            }
          }
        });
      }
    }

    const items = await fetchHydratedCart(user.userId);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('POST /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to merge cart' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCustomerUser();
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    const cart = await prisma.cart.findUnique({ where: { userId: user.userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ authenticated: true, items: [] });
  } catch (error) {
    console.error('DELETE /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
