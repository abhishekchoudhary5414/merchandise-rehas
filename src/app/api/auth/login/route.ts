import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

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

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });

    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sign in failed' }, { status: 500 });
  }
}
