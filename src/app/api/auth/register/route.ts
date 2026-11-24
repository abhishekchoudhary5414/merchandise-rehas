import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { verifyRegistrationOTP } from '@/lib/registration-otp';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, otpCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (!otpCode || String(otpCode).trim().length !== 6) {
      return NextResponse.json(
        { error: 'Please enter the 6-digit OTP code sent to your email.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify OTP first
    await verifyRegistrationOTP({
      email: cleanEmail,
      otpCode: String(otpCode).trim(),
    });

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || null,
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    const jwtSecret = process.env.JWT_SECRET || 'rehas_admin_jwt_secret_token_2026';
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    try {
      await prisma.authSession.create({
        data: {
          userId: user.id,
          tokenHash: token.slice(-32),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch {
      // Non-fatal session log
    }

    const response = NextResponse.json(
      {
        success: true,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      },
      { status: 201 }
    );

    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 });
  }
}
