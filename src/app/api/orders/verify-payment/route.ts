import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify cryptographic signature if live secret is available, or allow mock simulator
    const isMock = razorpayOrderId.startsWith('order_sim_') || process.env.RAZORPAY_SECRET_KEY_ID?.includes('placeholder');
    let isValid = false;

    if (isMock) {
      isValid = true;
    } else {
      isValid = verifyRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });
    }

    if (!isValid) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update order status only after verified payment
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId,
        razorpaySignature,
        shippingStatus: 'PROCESSING',
      },
    });

    // Reduce stock quantities
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
