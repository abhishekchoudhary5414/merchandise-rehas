import { NextResponse } from 'next/server';
import { sendPasswordResetOTP } from '@/lib/auth-otp';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    await sendPasswordResetOTP(email);

    return NextResponse.json({
      success: true,
      message: 'Password reset OTP has been sent to your email address.',
    });
  } catch (error: any) {
    console.error('Request OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process OTP request' },
      { status: 400 }
    );
  }
}
