import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.shippingConfig.findFirst();
    if (!config) {
      config = await prisma.shippingConfig.create({
        data: {
          freeShippingThreshold: 999,
          flatRate: 79,
          codEnabled: true,
          codFee: 49,
          gstPercentage: 18,
        },
      });
    }
    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const config = await prisma.shippingConfig.upsert({
      where: { id: 1 },
      update: {
        freeShippingThreshold: parseFloat(body.freeShippingThreshold),
        flatRate: parseFloat(body.flatRate),
        codEnabled: Boolean(body.codEnabled),
        codFee: parseFloat(body.codFee),
        gstPercentage: parseFloat(body.gstPercentage),
        serviceablePinCodes: body.serviceablePinCodes || null,
      },
      create: {
        id: 1,
        freeShippingThreshold: parseFloat(body.freeShippingThreshold) || 999,
        flatRate: parseFloat(body.flatRate) || 79,
        codEnabled: body.codEnabled !== undefined ? Boolean(body.codEnabled) : true,
        codFee: parseFloat(body.codFee) || 49,
        gstPercentage: parseFloat(body.gstPercentage) || 18,
        serviceablePinCodes: body.serviceablePinCodes || null,
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
