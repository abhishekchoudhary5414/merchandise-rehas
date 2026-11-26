import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeUnitPrice } from '@/lib/cart-pricing';

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const productIdsOrSlugs = items
      .map((it: { productId?: string; id?: string; slug?: string }) => it.productId || it.id || it.slug)
      .filter((v): v is string => Boolean(v));

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { id: { in: productIdsOrSlugs } },
          { slug: { in: productIdsOrSlugs } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        rootPrice: true,
        auraPrice: true,
        divinePrice: true,
        energyRitualPrice: true,
        primaryImage: true,
        inStock: true,
        stockQuantity: true,
        structuredContent: true,
      },
    });

    const productMap = new Map<string, (typeof products)[number]>();
    for (const p of products) {
      productMap.set(p.id, p);
      productMap.set(p.slug, p);
    }

    const validatedItems = items.map((item: { productId?: string; id?: string; slug?: string; tier?: string; ritual?: boolean; image?: string }) => {
      const p =
        (item.productId ? productMap.get(item.productId) : undefined) ||
        (item.id ? productMap.get(item.id) : undefined) ||
        (item.slug ? productMap.get(item.slug) : undefined);
      if (!p) {
        return item; // Keep as-is if not found
      }

      const unitPrice = computeUnitPrice(p, item.tier, Boolean(item.ritual));

      return {
        ...item,
        productId: p.id,
        name: p.name,
        slug: p.slug,
        image: item.image || p.primaryImage,
        unitPrice,
        price: unitPrice,
        inStock: p.inStock,
        maxStock: p.stockQuantity,
      };
    });

    return NextResponse.json({ items: validatedItems });
  } catch (err: unknown) {
    console.error('Error validating cart items:', err);
    return NextResponse.json({ error: 'Failed to validate cart' }, { status: 500 });
  }
}
