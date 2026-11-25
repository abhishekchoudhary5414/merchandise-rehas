import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const productIdsOrSlugs = items
      .map((it: any) => it.productId || it.id || it.slug)
      .filter(Boolean);

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

    const productMap = new Map<string, any>();
    for (const p of products) {
      productMap.set(p.id, p);
      productMap.set(p.slug, p);
    }

    const validatedItems = items.map((item: any) => {
      const p = productMap.get(item.productId) || productMap.get(item.id) || productMap.get(item.slug);
      if (!p) {
        return item; // Keep as-is if not found
      }

      // Calculate tier price
      const tier = (item.tier || 'root').toLowerCase();
      let basePrice = p.price;
      if (tier === 'aura' && p.auraPrice != null) {
        basePrice = p.auraPrice;
      } else if (tier === 'divine' && p.divinePrice != null) {
        basePrice = p.divinePrice;
      } else if (p.rootPrice != null) {
        basePrice = p.rootPrice;
      }

      const ritualAddon = item.ritual ? (p.energyRitualPrice || 150) : 0;
      const unitPrice = basePrice + ritualAddon;

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
  } catch (err: any) {
    console.error('Error validating cart items:', err);
    return NextResponse.json({ error: 'Failed to validate cart' }, { status: 500 });
  }
}
