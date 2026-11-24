import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';

/**
 * Razorpay Webhook Handler
 * Handles payment.captured, payment.failed, order.paid
 * Prevents replay/duplicate events and updates order status securely
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    // Verify webhook signature if secret configured
    const webhookSecret = process.env.RAZORPAY_SECRET_KEY_ID;
    if (webhookSecret) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment events
    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;

      if (razorpayOrderId) {
        const existingOrder = await prisma.order.findFirst({
          where: { razorpayOrderId },
        });

        // Duplicate webhook guard
        if (existingOrder && existingOrder.paymentStatus !== 'PAID') {
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              paymentStatus: 'PAID',
              razorpayPaymentId: razorpayPaymentId || existingOrder.razorpayPaymentId,
            },
          });
        }
      }
    } else if (event === 'payment.failed') {
      const payment = payload.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;

      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId, paymentStatus: 'PENDING' },
          data: { paymentStatus: 'FAILED' },
        });
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
