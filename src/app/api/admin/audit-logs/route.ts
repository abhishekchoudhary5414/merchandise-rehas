import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [recentUsers, recentOtps, recentSessions, recentOrders] = await Promise.all([
      prisma.user.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.userOtp.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          purpose: true,
          isUsed: true,
          createdAt: true,
          usedAt: true,
        },
      }),
      prisma.authSession.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true, role: true },
          },
        },
      }),
      prisma.order.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          totalAmount: true,
          paymentStatus: true,
          shippingStatus: true,
          createdAt: true,
        },
      }),
    ]);

    const events: any[] = [];

    // Map User registrations
    recentUsers.forEach((u) => {
      events.push({
        id: `user-reg-${u.id}`,
        title: 'New Patron Registered',
        description: `${u.name} (${u.email}) created a new account on REHAS.`,
        type: 'user',
        category: 'Registration',
        timestamp: u.createdAt,
        email: u.email,
        unread: false,
      });
    });

    // Map User Login / Sessions
    recentSessions.forEach((s) => {
      events.push({
        id: `user-login-${s.id}`,
        title: s.user.role === 'ADMIN' ? 'Admin Signed In' : 'User Patron Logged In',
        description: `${s.user.name} (${s.user.email}) authenticated and created an active web session.`,
        type: 'security',
        category: 'Login',
        timestamp: s.createdAt,
        email: s.user.email,
        unread: false,
      });
    });

    // Map Password Reset / OTP Activity
    recentOtps.forEach((o) => {
      if (o.purpose === 'PASSWORD_RESET') {
        events.push({
          id: `otp-req-${o.id}`,
          title: o.isUsed ? 'Password Reset Successfully' : 'Password Reset Requested',
          description: o.isUsed
            ? `Patron (${o.email}) verified reset OTP and updated their account password.`
            : `Patron (${o.email}) initiated forgot password and requested a verification OTP.`,
          type: 'security',
          category: o.isUsed ? 'Password Reset' : 'Forgot Password',
          timestamp: o.isUsed && o.usedAt ? o.usedAt : o.createdAt,
          email: o.email,
          unread: !o.isUsed,
        });
      }
    });

    // Map Orders
    recentOrders.forEach((o) => {
      events.push({
        id: `order-evt-${o.id}`,
        title: `Order #${o.orderNumber} Placed`,
        description: `${o.customerName} (${o.customerEmail}) ordered consecrated items for ₹${o.totalAmount} (Status: ${o.paymentStatus} / ${o.shippingStatus}).`,
        type: 'order',
        category: 'Order Activity',
        timestamp: o.createdAt,
        email: o.customerEmail,
        unread: o.paymentStatus === 'PAID',
      });
    });

    // Sort descending by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error: any) {
    console.error('Audit activity fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
