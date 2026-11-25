import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || 'rehas_admin_jwt_secret_token_2026';
    const decoded = jwt.verify(token, secret) as { userId?: string };
    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const body = await req.json();
    const fullName = String(body.fullName || '').trim();
    const phone = String(body.phone || '').replace(/[^0-9]/g, '').trim();
    const flatBuilding = String(body.flatBuilding || '').trim();
    const streetArea = String(body.streetArea || '').trim();
    const landmark = String(body.landmark || '').trim();
    const city = String(body.city || '').trim();
    const state = String(body.state || '').trim();
    const pinCode = String(body.pinCode || '').replace(/[^0-9]/g, '').trim();

    if (!fullName || phone.length !== 10 || !flatBuilding || !streetArea || !city || !state || pinCode.length !== 6) {
      return NextResponse.json({ error: 'Please complete all required address fields.' }, { status: 400 });
    }

    if (body.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    const count = await prisma.address.count({ where: { userId } });
    const data = { fullName, phone, flatBuilding, streetArea, landmark: landmark || null, city, state, pinCode, isDefault: body.isDefault || count === 0 };

    let address;
    if (body.id) {
      await prisma.address.updateMany({ where: { id: String(body.id), userId }, data });
      address = await prisma.address.findFirst({ where: { id: String(body.id), userId } });
    } else {
      address = await prisma.address.create({ data: { userId, ...data } });
    }

    if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not save address' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const { id, isDefault } = await req.json();
    if (!id) return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
      await prisma.address.updateMany({ where: { id: String(id), userId }, data: { isDefault: true } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not update address' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });

    await prisma.address.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not delete address' }, { status: 500 });
  }
}
