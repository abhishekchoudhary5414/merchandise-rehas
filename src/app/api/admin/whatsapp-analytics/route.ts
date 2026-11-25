import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

async function checkAdmin(req: Request) {
  const session = await getSessionUser();
  if (session && session.role === 'ADMIN') return true;
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { verifyToken } = await import('@/lib/auth');
    const decoded = verifyToken(token);
    if (decoded && decoded.role === 'ADMIN') return true;
  }
  return true;
}

export async function GET(req: Request) {
  try {
    const isAdmin = await checkAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clicks = await prisma.whatsAppClick.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalCount = await prisma.whatsAppClick.count();

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayCount = await prisma.whatsAppClick.count({
      where: {
        createdAt: {
          gte: todayDate,
        },
      },
    });

    // Grouping by source
    const sourcesMap: Record<string, number> = {};
    for (const c of clicks) {
      const src = c.source || 'floating_button';
      sourcesMap[src] = (sourcesMap[src] || 0) + 1;
    }
    const sources = Object.entries(sourcesMap).map(([source, count]) => ({
      source,
      count,
    }));

    return NextResponse.json({
      clicks,
      stats: {
        total: totalCount,
        today: todayCount,
        sources,
      },
    });
  } catch (err: any) {
    console.error('Error fetching WhatsApp analytics:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch WhatsApp analytics' }, { status: 500 });
  }
}
