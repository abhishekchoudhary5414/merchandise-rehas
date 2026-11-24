import { NextResponse } from 'next/server';
import { sendRegistrationOTP } from '@/lib/registration-otp';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const result = await sendRegistrationOTP(cleanEmail, name);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${result.email}. Please check your inbox or spam.`,
      email: result.email,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send registration OTP.' },
      { status: 400 }
    );
  }
}
