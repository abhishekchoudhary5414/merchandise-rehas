import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { changeUserPassword } from '@/lib/auth-otp';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('admin_token')?.value;
    }

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    await changeUserPassword({
      userId: decoded.userId || decoded.id,
      currentPassword,
      newPassword,
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been changed successfully.',
    });
  } catch (error: any) {
    console.error('Change Password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 400 }
    );
  }
}
