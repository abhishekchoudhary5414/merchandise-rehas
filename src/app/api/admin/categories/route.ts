import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load categories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, imageUrl, driveFileId } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name: cleanName,
        slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        driveFileId: driveFileId || null,
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
