import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const words = query.split(/\s+/).filter(Boolean);

    const products = await prisma.product.findMany({
      where: {
        AND: words.map((w) => ({
          OR: [
            { name: { contains: w, mode: 'insensitive' } },
            { description: { contains: w, mode: 'insensitive' } },
            { shortDescription: { contains: w, mode: 'insensitive' } },
            { primaryCrystal: { contains: w, mode: 'insensitive' } },
            { rulingPlanet: { contains: w, mode: 'insensitive' } },
            { zodiacSigns: { contains: w, mode: 'insensitive' } },
            { beadSize: { contains: w, mode: 'insensitive' } },
            { sku: { contains: w, mode: 'insensitive' } },
          ],
        })),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        rootPrice: true,
        primaryImage: true,
        inStock: true,
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Search API error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Search failed' }, { status: 500 });
  }
}
