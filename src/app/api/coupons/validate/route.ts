import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const activeCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { discountPct: 'desc' },
    });

    const preferred =
      activeCoupons.find((c) => c.code === 'WELCOME10') ||
      activeCoupons.find((c) => c.code === 'REHAS10') ||
      activeCoupons[0] ||
      null;

    return NextResponse.json({
      offer: preferred
        ? {
            code: preferred.code,
            discountPct: preferred.discountPct,
            minOrderValue: preferred.minOrderValue,
            maxDiscount: preferred.maxDiscount,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load offer' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body.code || '').trim().toUpperCase();
    const subtotal = Number(body.subtotal || 0);

    if (!code) {
      return NextResponse.json({ error: 'Please enter a coupon code' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum order value of ₹${coupon.minOrderValue} required for ${coupon.code}` },
        { status: 400 }
      );
    }

    let discountAmount = Math.round((subtotal * coupon.discountPct) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = Math.round(coupon.maxDiscount);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountPct: coupon.discountPct,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
      },
      discountAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to validate coupon' }, { status: 500 });
  }
}
