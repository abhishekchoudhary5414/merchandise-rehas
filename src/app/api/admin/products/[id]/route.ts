import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFileFromDrive } from '@/lib/google-drive';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Automatically delete old Google Drive files that were removed or replaced
    try {
      const oldContent = (existing.structuredContent as any) || {};
      const newContent = (body.structuredContent as any) || {};
      const oldMedia: any[] = Array.isArray(oldContent.media) ? oldContent.media : [];
      const newMedia: any[] = Array.isArray(newContent.media) ? newContent.media : [];
      const newFileIds = new Set(newMedia.map((m) => m.fileId).filter(Boolean));

      for (const oldItem of oldMedia) {
        if (oldItem.fileId && !newFileIds.has(oldItem.fileId)) {
          await deleteFileFromDrive(oldItem.fileId);
        }
      }
    } catch (driveErr) {
      console.error('Non-fatal error cleaning up old Drive media:', driveErr);
    }

    const parsedStock =
      body.stockQuantity !== undefined ? parseInt(body.stockQuantity, 10) : existing.stockQuantity;

    const baseUpdate = {
      name: body.name ?? existing.name,
      sku: body.sku ?? existing.sku,
      categoryId: body.categoryId ?? existing.categoryId,
      shortDescription: body.shortDescription ?? existing.shortDescription,
      description: body.description ?? existing.description,
      price: body.price !== undefined ? Number(body.price) : existing.price,
      compareAtPrice:
        body.compareAtPrice !== undefined
          ? body.compareAtPrice
            ? Number(body.compareAtPrice)
            : null
          : existing.compareAtPrice,
      zodiacSigns: body.zodiacSigns ?? existing.zodiacSigns,
      rulingPlanet: body.rulingPlanet ?? existing.rulingPlanet,
      mulankNumber: body.mulankNumber ?? existing.mulankNumber,
      primaryCrystal: body.primaryCrystal ?? existing.primaryCrystal,
      stockQuantity: parsedStock,
      inStock: parsedStock > 0,
      primaryImage: body.primaryImage ?? existing.primaryImage,
    };

    const nextRoot = body.rootPrice !== undefined ? Number(body.rootPrice) : existing.rootPrice;
    const nextAura = body.auraPrice !== undefined ? Number(body.auraPrice) : existing.auraPrice;
    const nextDivine = body.divinePrice !== undefined ? Number(body.divinePrice) : existing.divinePrice;
    const nextRitualPrice =
      body.energyRitualPrice !== undefined ? Number(body.energyRitualPrice) : existing.energyRitualPrice;
    const nextRitualDesc = body.energyRitualDesc ?? existing.energyRitualDesc;
    const nextStructured =
      body.structuredContent !== undefined ? body.structuredContent : existing.structuredContent;

    let updated: any;
    try {
      updated = await prisma.product.update({
        where: { id },
        data: {
          ...baseUpdate,
          rootPrice: nextRoot,
          auraPrice: nextAura,
          divinePrice: nextDivine,
          energyRitualPrice: nextRitualPrice,
          energyRitualDesc: nextRitualDesc,
          structuredContent: nextStructured,
        },
        include: { category: true, images: true },
      });
    } catch (updateErr: any) {
      if (String(updateErr?.message || '').includes('Unknown argument')) {
        updated = await prisma.product.update({
          where: { id },
          data: baseUpdate,
          include: { category: true, images: true },
        });
        await prisma.$executeRawUnsafe(
          `UPDATE "Product" SET "rootPrice" = $1, "auraPrice" = $2, "divinePrice" = $3, "energyRitualPrice" = $4, "energyRitualDesc" = $5, "structuredContent" = $6::jsonb WHERE id = $7`,
          nextRoot,
          nextAura,
          nextDivine,
          nextRitualPrice,
          nextRitualDesc,
          nextStructured ? JSON.stringify(nextStructured) : null,
          id
        );
        updated = {
          ...updated,
          rootPrice: nextRoot,
          auraPrice: nextAura,
          divinePrice: nextDivine,
          energyRitualPrice: nextRitualPrice,
          energyRitualDesc: nextRitualDesc,
          structuredContent: nextStructured,
        };
      } else {
        throw updateErr;
      }
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    const content = (existing.structuredContent as { media?: Array<{ fileId?: string }> }) || {};
    const media = Array.isArray(content.media) ? content.media : [];
    for (const item of media) {
      if (item.fileId) {
        await deleteFileFromDrive(item.fileId).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
