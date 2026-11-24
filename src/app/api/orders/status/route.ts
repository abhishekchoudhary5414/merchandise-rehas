import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('orderNumber');
  if (!orderNumber) return NextResponse.json({ error: 'Order number is required' }, { status: 400 });

  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;
  if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const secret = process.env.JWT_SECRET || 'rehas_admin_jwt_secret_token_2026';
    const decoded = jwt.verify(token, secret) as { userId?: string; email?: string };
    if (!decoded.userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        customerEmail: true,
        paymentMethod: true,
        paymentStatus: true,
        shippingStatus: true,
        trackingNumber: true,
        trackingCourier: true,
        createdAt: true,
        userId: true,
      },
    });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.userId !== decoded.userId && order.customerEmail.toLowerCase() !== decoded.email?.toLowerCase()) {
      return NextResponse.json({ error: 'You do not have permission to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not load order' }, { status: 500 });
  }
}
