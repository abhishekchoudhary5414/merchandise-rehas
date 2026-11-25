import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRazorpayClient } from '@/lib/razorpay';
import { sendOrderStatusEmail } from '@/lib/email';

/**
 * Secure Admin Refund endpoint
 * Supports automated Razorpay refund with instant fallback & manual store credit/offline refund option
 */
export async function POST(req: Request) {
  try {
    const { orderId, amount, reason, forceOfflineRefund } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'REFUNDED') {
      return NextResponse.json({ error: 'Order is already marked as REFUNDED' }, { status: 400 });
    }

    let razorpayRefundResult: any = null;
    let refundNotice = '';

    // 1. Process automated refund through Razorpay if requested and not forced offline
    if (order.paymentMethod === 'RAZORPAY' && order.razorpayPaymentId && !forceOfflineRefund) {
      const rzp = getRazorpayClient();
      if (rzp) {
        const refundAmountPaise = amount ? Math.round(amount * 100) : Math.round(order.totalAmount * 100);
        try {
          razorpayRefundResult = await rzp.payments.refund(order.razorpayPaymentId, {
            amount: refundAmountPaise,
            notes: {
              reason: reason || 'Customer requested return and refund',
              orderNumber: order.orderNumber,
            },
          });
        } catch (rzpErr: any) {
          const rzpMsg = rzpErr.error?.description || rzpErr.message || 'Razorpay gateway rejected refund';
          console.warn('Razorpay refund error:', rzpMsg);

          // Return clear actionable message so admin understands why Razorpay failed
          return NextResponse.json(
            {
              error: `Razorpay Gateway: ${rzpMsg}`,
              canForceOffline: true,
              details: rzpMsg,
            },
            { status: 400 }
          );
        }
      }
    } else if (forceOfflineRefund) {
      refundNotice = ' (Recorded as Offline/Direct Refund)';
    }

    // 2. Update order status in Neon DB to REFUNDED & restore product stock
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'REFUNDED',
        shippingStatus: 'REFUNDED',
      },
      include: {
        items: true,
      },
    });

    // Automatically replenish inventory stock when order is refunded
    for (const item of updated.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { increment: item.quantity },
        },
      });
    }

    // 3. Shoot Email Notification to user for Refund
    try {
      await sendOrderStatusEmail({
        to: order.customerEmail,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        status: 'REFUNDED',
        amount: amount || order.totalAmount,
        reason: reason || 'Customer requested return and refund',
      });
    } catch (mailErr) {
      console.warn('Failed to send refund email:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${amount || order.totalAmount} processed successfully${refundNotice}`,
      order: updated,
      razorpayRefund: razorpayRefundResult,
    });
  } catch (error: any) {
    console.error('Refund processing error:', error);
    return NextResponse.json({ error: error.message || 'Refund failed' }, { status: 500 });
  }
}
