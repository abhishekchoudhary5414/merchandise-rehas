import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { code: 'asc' },
    });
    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body.code || '').trim().toUpperCase();
    const discountPct = Number(body.discountPct);
    const minOrderValue = Number(body.minOrderValue ?? 0);
    const maxDiscount = body.maxDiscount !== undefined && body.maxDiscount !== '' && body.maxDiscount !== null
      ? Number(body.maxDiscount)
      : null;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    if (!code || code.length < 3) {
      return NextResponse.json({ error: 'Coupon code must be at least 3 characters' }, { status: 400 });
    }
    if (Number.isNaN(discountPct) || discountPct <= 0 || discountPct > 90) {
      return NextResponse.json({ error: 'Discount percentage must be between 1 and 90' }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: `Coupon "${code}" already exists` }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountPct,
        minOrderValue: Number.isNaN(minOrderValue) ? 0 : minOrderValue,
        maxDiscount,
        isActive,
        expiresAt,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}
