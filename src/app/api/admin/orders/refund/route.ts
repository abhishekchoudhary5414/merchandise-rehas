import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRazorpayClient } from '@/lib/razorpay';

/**
 * Secure Admin Refund endpoint
 */
export async function POST(req: Request) {
  try {
    const { orderId, amount, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus !== 'PAID') {
      return NextResponse.json({ error: 'Cannot refund an unpaid or already refunded order' }, { status: 400 });
    }

    // Process refund through Razorpay if it was a prepaid order
    if (order.paymentMethod === 'RAZORPAY' && order.razorpayPaymentId) {
      const rzp = getRazorpayClient();
      if (rzp) {
        const refundAmountPaise = amount ? Math.round(amount * 100) : Math.round(order.totalAmount * 100);
        await rzp.payments.refund(order.razorpayPaymentId, {
          amount: refundAmountPaise,
          notes: {
            reason: reason || 'Customer requested return and refund',
            orderNumber: order.orderNumber,
          },
        });
      }
    }

    // Update order status to REFUNDED
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'REFUNDED',
        shippingStatus: 'REFUNDED',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${amount || order.totalAmount} processed successfully`,
      order: updated,
    });
  } catch (error: any) {
    console.error('Refund processing error:', error);
    return NextResponse.json({ error: error.message || 'Refund failed' }, { status: 500 });
  }
}
