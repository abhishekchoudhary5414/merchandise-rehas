import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || 'rehas_admin_jwt_secret_token_2026';
    const decoded = jwt.verify(token, secret) as { userId?: string };
    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { OR: [{ userId }, { customerEmail: user.email }] },
      include: { items: { include: { product: { select: { name: true, primaryImage: true, slug: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ user, orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not load account' }, { status: 500 });
  }
}
