import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [shipping, activeCoupon] = await Promise.all([
      prisma.shippingConfig.findFirst(),
      prisma.coupon.findFirst({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { discountPct: 'desc' },
      }),
    ]);

    const freeThreshold = shipping?.freeShippingThreshold ?? 999;
    const couponCode = activeCoupon?.code ?? 'REHAS10';
    const discountPct = activeCoupon?.discountPct ?? 10;

    const announcements = [
      '✨ REHAS Sacred Merchandise: Hand-Selected Natural Crystals Consecrated with Vedic Mantras',
      `🚚 Free Express Doorstep Delivery Across India on Orders Above ₹${freeThreshold}`,
      `💎 Use Code ${couponCode} for ${discountPct}% Instant Festive Off`,
      '🛡️ 100% Secured Razorpay (Cards, UPI, NetBanking) Payments',
      '🕉️ Authentic Gemstone Lab Certification Included with Every Order',
    ];

    return NextResponse.json({
      freeThreshold,
      couponCode,
      discountPct,
      announcements,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        freeThreshold: 999,
        couponCode: 'REHAS10',
        discountPct: 10,
        announcements: [
          '✨ REHAS Sacred Merchandise: Natural Crystals Consecrated with Vedic Mantras',
          '🚚 Free Express Doorstep Delivery Across India on Orders Above ₹999',
          '💎 Use Code REHAS10 for 10% Instant Festive Off',
          '🛡️ 100% Secured Razorpay Payments',
          '🕉️ Authentic Gemstone Lab Certification Included',
        ],
      },
      { status: 200 }
    );
  }
}
