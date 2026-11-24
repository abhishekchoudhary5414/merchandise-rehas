import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFileFromDrive } from '@/lib/google-drive';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, imageUrl, driveFileId } = await req.json();

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Automatically delete old category image from Google Drive if replaced or removed
    if (existing.driveFileId && existing.driveFileId !== driveFileId) {
      await deleteFileFromDrive(existing.driveFileId);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name?.trim() || existing.name,
        description: description !== undefined ? description?.trim() || null : existing.description,
        imageUrl: imageUrl !== undefined ? imageUrl || null : existing.imageUrl,
        driveFileId: driveFileId !== undefined ? driveFileId || null : existing.driveFileId,
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ success: true, category: updated });
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
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${existing.name}" because ${existing._count.products} product(s) belong to it. Reassign or delete those products first.` },
        { status: 400 }
      );
    }

    if (existing.driveFileId) {
      await deleteFileFromDrive(existing.driveFileId);
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
