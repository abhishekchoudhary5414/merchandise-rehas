import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/email';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH function to handle updates for order fulfillment status and tracking details
export async function PATCH(req: Request) {
  try {
    const { orderId, shippingStatus, trackingNumber, trackingCourier } = await req.json();
    if (!orderId || !shippingStatus) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const validStatuses = ['PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'REFUNDED'];
    if (!validStatuses.includes(shippingStatus)) {
      return NextResponse.json({ error: 'Invalid delivery status' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingStatus,
        ...(trackingNumber ? { trackingNumber: trackingNumber.trim() } : {}),
        ...(trackingCourier ? { trackingCourier: trackingCourier.trim() } : {}),
      },
    });

    await sendOrderStatusEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      status: shippingStatus,
      trackingNumber: order.trackingNumber,
    });

    return NextResponse.json({ success: true, order, message: `Status updated to ${shippingStatus.replaceAll('_', ' ')}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not update order status' }, { status: 500 });
  }
}
