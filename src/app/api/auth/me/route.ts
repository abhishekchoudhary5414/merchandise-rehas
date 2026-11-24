import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const jwtSecret = process.env.JWT_SECRET || 'rehas_admin_jwt_secret_token_2026';
    const decoded: any = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json({ user: user || null });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;
    if (token) {
      await prisma.authSession.updateMany({
        where: { tokenHash: token.slice(-32), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  } catch {
    // Ignore
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete('customer_token');
  return res;
}
