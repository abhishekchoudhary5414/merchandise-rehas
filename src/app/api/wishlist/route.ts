import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerUser } from '@/lib/customer-auth';

interface IncomingWishlistItem {
  id?: string;
  productId?: string;
  slug?: string;
}

async function fetchHydratedWishlist(userId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              rootPrice: true,
              primaryImage: true,
            },
          },
        },
      },
    },
  });

  if (!wishlist) return [];

  return wishlist.items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    slug: item.product.slug,
    price: item.product.rootPrice ?? item.product.price,
    image: item.product.primaryImage,
  }));
}

async function resolveValidProductIds(items: IncomingWishlistItem[]): Promise<string[]> {
  const keys = items
    .map((it) => it.productId || it.id || it.slug)
    .filter((v): v is string => Boolean(v));

  if (keys.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { OR: [{ id: { in: keys } }, { slug: { in: keys } }] },
    select: { id: true },
  });

  return Array.from(new Set(products.map((p) => p.id)));
}

export async function GET() {
  try {
    const user = await getCustomerUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, items: [] });
    }

    const items = await fetchHydratedWishlist(user.userId);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('GET /api/wishlist error:', error);
    return NextResponse.json({ error: 'Failed to load wishlist' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCustomerUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, items: [] }, { status: 401 });
    }

    const body = await req.json();
    const rawItems: IncomingWishlistItem[] = Array.isArray(body?.items) ? body.items : [];
    const productIds = await resolveValidProductIds(rawItems);

    await prisma.$transaction(async (tx) => {
      const wishlist = await tx.wishlist.upsert({
        where: { userId: user.userId },
        update: {},
        create: { userId: user.userId },
      });

      await tx.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });

      if (productIds.length > 0) {
        await tx.wishlistItem.createMany({
          data: productIds.map((productId) => ({
            wishlistId: wishlist.id,
            productId,
          })),
          skipDuplicates: true,
        });
      }
    });

    const items = await fetchHydratedWishlist(user.userId);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('PUT /api/wishlist error:', error);
    return NextResponse.json({ error: 'Failed to sync wishlist' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCustomerUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, items: [] }, { status: 401 });
    }

    const body = await req.json();
    const guestItems: IncomingWishlistItem[] = Array.isArray(body?.items) ? body.items : [];
    const productIds = await resolveValidProductIds(guestItems);

    if (productIds.length > 0) {
      const wishlist = await prisma.wishlist.upsert({
        where: { userId: user.userId },
        update: {},
        create: { userId: user.userId },
      });

      await prisma.wishlistItem.createMany({
        data: productIds.map((productId) => ({
          wishlistId: wishlist.id,
          productId,
        })),
        skipDuplicates: true,
      });
    }

    const items = await fetchHydratedWishlist(user.userId);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('POST /api/wishlist error:', error);
    return NextResponse.json({ error: 'Failed to merge wishlist' }, { status: 500 });
  }
}
