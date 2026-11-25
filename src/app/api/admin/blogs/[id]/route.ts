import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFileFromDrive } from '@/lib/google-drive';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Blog article not found' }, { status: 404 });
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        summary: body.summary ?? existing.summary,
        content: body.content ?? existing.content,
        imageUrl: body.imageUrl ?? existing.imageUrl,
        author: body.author ?? existing.author,
        tags: body.tags ?? existing.tags,
        published: body.published !== undefined ? Boolean(body.published) : existing.published,
      },
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error: any) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: error.message || 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Blog article not found' }, { status: 404 });
    }

    // Try deleting Drive file if it's stored on Drive
    if (existing.imageUrl && existing.imageUrl.includes('googleusercontent.com/d/')) {
      const match = existing.imageUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        await deleteFileFromDrive(match[1]).catch(() => {});
      }
    }

    await prisma.blog.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete blog' }, { status: 500 });
  }
}
