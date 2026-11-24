import { NextResponse } from 'next/server';
import { verifyOTPAndResetPassword } from '@/lib/auth-otp';

export async function POST(req: Request) {
  try {
    const { email, otpCode, newPassword } = await req.json();

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP code, and new password are required' },
        { status: 400 }
      );
    }

    await verifyOTPAndResetPassword({ email, otpCode, newPassword });

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully reset. You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset Password OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 400 }
    );
  }
}
