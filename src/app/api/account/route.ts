import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    // 1. Fetch user profile & addresses with selected fields
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            flatBuilding: true,
            streetArea: true,
            landmark: true,
            city: true,
            state: true,
            pinCode: true,
            isDefault: true,
          },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // 2. Fetch recent orders directly by indexed userId & lean fields
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ userId }, { customerEmail: user.email }],
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        shippingStatus: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                primaryImage: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const response = NextResponse.json({ user, orders });
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not load account' }, { status: 500 });
  }
}
