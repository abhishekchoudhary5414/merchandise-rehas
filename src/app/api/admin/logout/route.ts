import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (token) {
      await prisma.authSession.updateMany({
        where: { tokenHash: token.slice(-32), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  } catch (e) {
    console.warn('Logout session revoke note:', e);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('admin_token');
  return response;
}
