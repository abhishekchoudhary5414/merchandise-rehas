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

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { name, phone } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, '').trim() : null;
    if (cleanPhone && cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        phone: cleanPhone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not update profile' }, { status: 500 });
  }
}
