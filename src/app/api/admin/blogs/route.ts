import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFileFromDrive } from '@/lib/google-drive';

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, summary, content, imageUrl, author, tags, published } = body;

    if (!title || !summary) {
      return NextResponse.json({ error: 'Title and summary are required' }, { status: 400 });
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newBlog = await prisma.blog.create({
      data: {
        title,
        slug,
        summary,
        content: content || summary,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
        author: author || 'Astro Acharya - REHAS',
        tags: tags || 'Vedic Wisdom',
        published: published !== undefined ? Boolean(published) : true,
      },
    });

    return NextResponse.json({ success: true, blog: newBlog });
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 500 });
  }
}
