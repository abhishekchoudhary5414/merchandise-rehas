import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        orderItems: {
          select: { quantity: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = products.map((p) => {
      const soldCount = p.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const { orderItems, ...rest } = p;
      return {
        ...rest,
        soldCount,
      };
    });

    return NextResponse.json({ products: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      shortDescription,
      description,
      price,
      compareAtPrice,
      rootPrice,
      auraPrice,
      divinePrice,
      energyRitualPrice,
      energyRitualDesc,
      structuredContent,
      sku,
      barcode,
      mpn,
      categoryId,
      beadSize,
      primaryCrystal,
      associatedChakra,
      rulingPlanet,
      zodiacSigns,
      mulankNumber,
      stockQuantity,
      primaryImage,
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      indexable,
    } = body;

    let targetCategoryId = categoryId;
    if (!targetCategoryId) {
      let firstCat = await prisma.category.findFirst();
      if (!firstCat) {
        firstCat = await prisma.category.create({
          data: {
            name: 'Astrology & Navgraha',
            slug: 'astrology-navgraha',
            description: 'Sacred energized astrology crystal bracelets',
          },
        });
      }
      targetCategoryId = firstCat.id;
    }

    const cleanSlug =
      slug ||
      `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const baseData = {
      name,
      slug: cleanSlug,
      shortDescription: shortDescription || '',
      description: description || '',
      price: Number(price || rootPrice || 0),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      sku: sku || `REHAS-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: barcode || null,
      mpn: mpn || null,
      categoryId: targetCategoryId,
      beadSize: beadSize || '8mm',
      primaryCrystal: primaryCrystal || null,
      associatedChakra: associatedChakra || null,
      rulingPlanet: rulingPlanet || null,
      zodiacSigns: zodiacSigns || null,
      mulankNumber: mulankNumber || null,
      stockQuantity: parseInt(stockQuantity, 10) || 0,
      primaryImage: primaryImage || 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=1200&q=80',
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoKeywords: seoKeywords || null,
      canonicalUrl: canonicalUrl || null,
      ogTitle: ogTitle || null,
      ogDescription: ogDescription || null,
      ogImage: ogImage || null,
      twitterTitle: twitterTitle || null,
      twitterDescription: twitterDescription || null,
      twitterImage: twitterImage || null,
      indexable: indexable !== undefined ? Boolean(indexable) : true,
    };

    const extraRootPrice = rootPrice ? Number(rootPrice) : null;
    const extraAuraPrice = auraPrice ? Number(auraPrice) : null;
    const extraDivinePrice = divinePrice ? Number(divinePrice) : null;
    const extraRitualPrice = energyRitualPrice !== undefined ? Number(energyRitualPrice) : 150.0;
    const extraRitualDesc =
      energyRitualDesc ||
      'Your bracelet will be purified and energized through sacred rituals to enhance protection, confidence, and success energy.';
    const extraStructured = structuredContent || null;

    let product: any;
    try {
      product = await prisma.product.create({
        data: {
          ...baseData,
          rootPrice: extraRootPrice,
          auraPrice: extraAuraPrice,
          divinePrice: extraDivinePrice,
          energyRitualPrice: extraRitualPrice,
          energyRitualDesc: extraRitualDesc,
          structuredContent: extraStructured,
        },
        include: { category: true, images: true },
      });
    } catch (createErr: any) {
      if (String(createErr?.message || '').includes('Unknown argument')) {
        // Fallback when next dev holds a pre-migration PrismaClient singleton in memory
        product = await prisma.product.create({
          data: baseData,
          include: { category: true, images: true },
        });
        await prisma.$executeRawUnsafe(
          `UPDATE "Product" SET "rootPrice" = $1, "auraPrice" = $2, "divinePrice" = $3, "energyRitualPrice" = $4, "energyRitualDesc" = $5, "structuredContent" = $6::jsonb WHERE id = $7`,
          extraRootPrice,
          extraAuraPrice,
          extraDivinePrice,
          extraRitualPrice,
          extraRitualDesc,
          extraStructured ? JSON.stringify(extraStructured) : null,
          product.id
        );
        product = {
          ...product,
          rootPrice: extraRootPrice,
          auraPrice: extraAuraPrice,
          divinePrice: extraDivinePrice,
          energyRitualPrice: extraRitualPrice,
          energyRitualDesc: extraRitualDesc,
          structuredContent: extraStructured,
        };
      } else {
        throw createErr;
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
