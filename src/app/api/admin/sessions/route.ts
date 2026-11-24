import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || 'rehas_admin_jwt_secret_token_2026';
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const currentTokenHash = token.slice(-32);
    const currentSession = await prisma.authSession.findFirst({
      where: {
        userId: decoded.userId,
        tokenHash: currentTokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!currentSession) {
      const res = NextResponse.json({ error: 'Session has been revoked or expired' }, { status: 401 });
      res.cookies.delete('admin_token');
      return res;
    }

    const sessions = await prisma.authSession.findMany({
      where: {
        userId: decoded.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.tokenHash === currentTokenHash,
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || 'rehas_admin_jwt_secret_token_2026';
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const currentTokenHash = token.slice(-32);
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const target = await prisma.authSession.findFirst({
      where: { id: sessionId, userId: decoded.userId },
    });

    if (!target) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await prisma.authSession.update({
      where: { id: target.id },
      data: { revokedAt: new Date() },
    });

    const isCurrent = target.tokenHash === currentTokenHash;
    const response = NextResponse.json({ success: true, isCurrent });

    if (isCurrent) {
      response.cookies.delete('admin_token');
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
