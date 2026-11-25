import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Fetch all orders with customer details
    const allOrders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        city: true,
        state: true,
        pinCode: true,
        totalAmount: true,
        paymentStatus: true,
        shippingStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch all registered CUSTOMER users
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            flatBuilding: true,
            streetArea: true,
            landmark: true,
            city: true,
            state: true,
            pinCode: true,
            isDefault: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Build lookup map of registered users by email and ID
    const userByEmail = new Map<string, any>();
    const userById = new Map<string, any>();

    for (const u of users) {
      userByEmail.set(u.email.toLowerCase().trim(), u);
      userById.set(u.id, u);
    }

    // Structure customer aggregation
    interface CustomerAgg {
      id: string;
      userId: string | null;
      name: string;
      email: string;
      phone: string;
      type: 'Registered Patron' | 'Guest Shopper';
      joinedAt: Date | string;
      city: string;
      state: string;
      defaultAddress: string;
      totalOrders: number;
      totalSpent: number;
      paidAmount: number;
      pendingAmount: number;
      cancelledAmount: number;
      paidCount: number;
      pendingCount: number;
      cancelledCount: number;
      orders: any[];
    }

    const customerMap = new Map<string, CustomerAgg>();

    // First populate registered users
    for (const u of users) {
      const emailKey = u.email.toLowerCase().trim();
      const defaultAddr = u.addresses.find((a) => a.isDefault) || u.addresses[0];
      const addressString = defaultAddr
        ? `${defaultAddr.flatBuilding}, ${defaultAddr.streetArea}, ${defaultAddr.city}, ${defaultAddr.state} - ${defaultAddr.pinCode}`
        : 'Location Pending';

      customerMap.set(emailKey, {
        id: u.id,
        userId: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || defaultAddr?.phone || 'N/A',
        type: 'Registered Patron',
        joinedAt: u.createdAt,
        city: defaultAddr?.city || 'Location Pending',
        state: defaultAddr?.state || '',
        defaultAddress: addressString,
        totalOrders: 0,
        totalSpent: 0,
        paidAmount: 0,
        pendingAmount: 0,
        cancelledAmount: 0,
        paidCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
        orders: [],
      });
    }

    // Now aggregate each order into its customer (matching by userId or customerEmail)
    for (const ord of allOrders) {
      const emailKey = ord.customerEmail ? ord.customerEmail.toLowerCase().trim() : '';
      let targetCust = ord.userId ? userById.get(ord.userId) : null;
      let aggKey = '';

      if (targetCust) {
        aggKey = targetCust.email.toLowerCase().trim();
      } else if (emailKey && customerMap.has(emailKey)) {
        aggKey = emailKey;
      } else if (emailKey) {
        // Create new guest customer entry if not already present
        aggKey = emailKey;
        if (!customerMap.has(aggKey)) {
          customerMap.set(aggKey, {
            id: `guest-${ord.id}`,
            userId: null,
            name: ord.customerName || 'Valued Guest',
            email: ord.customerEmail,
            phone: ord.customerPhone || 'N/A',
            type: 'Guest Shopper',
            joinedAt: ord.createdAt,
            city: ord.city || 'Location Pending',
            state: ord.state || '',
            defaultAddress: ord.city ? `${ord.city}, ${ord.state} - ${ord.pinCode}` : 'Location Pending',
            totalOrders: 0,
            totalSpent: 0,
            paidAmount: 0,
            pendingAmount: 0,
            cancelledAmount: 0,
            paidCount: 0,
            pendingCount: 0,
            cancelledCount: 0,
            orders: [],
          });
        }
      }

      if (aggKey && customerMap.has(aggKey)) {
        const cust = customerMap.get(aggKey)!;
        const amount = ord.totalAmount || 0;
        const pStatus = (ord.paymentStatus || 'PENDING').toUpperCase();
        const sStatus = (ord.shippingStatus || '').toUpperCase();

        cust.totalOrders += 1;
        cust.totalSpent += amount;

        const isCancelled = pStatus === 'CANCELLED' || pStatus === 'REFUNDED' || sStatus === 'CANCELLED' || sStatus === 'REFUNDED';
        const isPaid = pStatus === 'PAID';

        if (isCancelled) {
          cust.cancelledAmount += amount;
          cust.cancelledCount += 1;
        } else if (isPaid) {
          cust.paidAmount += amount;
          cust.paidCount += 1;
        } else {
          // PENDING, UNPAID, or FAILED
          cust.pendingAmount += amount;
          cust.pendingCount += 1;
        }

        // If phone or city was missing in registered profile, backfill from order
        if ((cust.phone === 'N/A' || !cust.phone) && ord.customerPhone) {
          cust.phone = ord.customerPhone;
        }
        if ((cust.city === 'Location Pending' || !cust.city) && ord.city) {
          cust.city = ord.city;
          cust.state = ord.state;
          cust.defaultAddress = `${ord.city}, ${ord.state} - ${ord.pinCode}`;
        }

        cust.orders.push({
          id: ord.id,
          orderNumber: ord.orderNumber,
          totalAmount: amount,
          paymentStatus: ord.paymentStatus,
          shippingStatus: ord.shippingStatus,
          createdAt: ord.createdAt,
        });
      }
    }

    const customers = Array.from(customerMap.values());

    // Summary metrics across all patrons
    const overview = {
      totalCustomers: customers.length,
      registeredCount: customers.filter((c) => c.type === 'Registered Patron').length,
      guestCount: customers.filter((c) => c.type === 'Guest Shopper').length,
      totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
      totalLifetimeSpend: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      totalPaidAmount: customers.reduce((sum, c) => sum + c.paidAmount, 0),
      totalPendingAmount: customers.reduce((sum, c) => sum + c.pendingAmount, 0),
      totalCancelledAmount: customers.reduce((sum, c) => sum + c.cancelledAmount, 0),
    };

    return NextResponse.json({
      customers,
      overview,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/customers:', error);
    return NextResponse.json({ error: error.message || 'Could not fetch customers' }, { status: 500 });
  }
}
