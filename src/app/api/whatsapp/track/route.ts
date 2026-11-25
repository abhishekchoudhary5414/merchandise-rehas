import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { source = 'floating_button', referrer, pageUrl } = body;

    const track = await prisma.whatsAppClick.create({
      data: {
        source: String(source || 'floating_button'),
        referrer: referrer ? String(referrer) : null,
        pageUrl: pageUrl ? String(pageUrl) : null,
      },
    });

    return NextResponse.json({ success: true, id: track.id });
  } catch (error: any) {
    console.error('CRITICAL: Error tracking WhatsApp click:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to record click' }, { status: 500 });
  }
}
