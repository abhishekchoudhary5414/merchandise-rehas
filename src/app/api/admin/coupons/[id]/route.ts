import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data: Record<string, any> = {};
    if (body.code !== undefined) data.code = String(body.code).trim().toUpperCase();
    if (body.discountPct !== undefined) data.discountPct = Number(body.discountPct);
    if (body.minOrderValue !== undefined) data.minOrderValue = Number(body.minOrderValue);
    if (body.maxDiscount !== undefined) {
      data.maxDiscount =
        body.maxDiscount === null || body.maxDiscount === '' ? null : Number(body.maxDiscount);
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.expiresAt !== undefined) {
      data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data,
    });

    return NextResponse.json({ coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete coupon' }, { status: 500 });
  }
}
