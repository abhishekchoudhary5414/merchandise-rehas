import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { orderId, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only cancel if not already paid
    if (existing.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'CANCELLED',
        shippingStatus: 'CANCELLED',
      },
    });

    // Shoot Cancelled Order Email
    try {
      await sendOrderStatusEmail({
        to: existing.customerEmail,
        customerName: existing.customerName,
        orderNumber: existing.orderNumber,
        status: 'CANCELLED',
        amount: existing.totalAmount,
        reason: reason || 'Customer cancelled order payment',
      });
    } catch (mailErr) {
      console.warn('Failed to send cancel order email:', mailErr);
    }

    return NextResponse.json({
      success: true,
      order: updated,
      message: 'Order payment was cancelled.',
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: error.message || 'Could not cancel order' },
      { status: 500 }
    );
  }
}
