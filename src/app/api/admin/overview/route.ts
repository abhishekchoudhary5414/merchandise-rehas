import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [orders, products, customerCount] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        include: {
          category: true,
          orderItems: { select: { quantity: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // 1. Last 7 Days Revenue Series (Real Data)
    const revenueMap = new Map<string, { day: string; revenue: number; orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      revenueMap.set(key, { day: label, revenue: 0, orders: 0 });
    }

    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const bucket = revenueMap.get(key);
      if (bucket) {
        bucket.orders += 1;
        if (o.paymentStatus === 'PAID') {
          bucket.revenue += o.totalAmount || 0;
        }
      }
    }
    const revenueSeries = Array.from(revenueMap.values());

    // 2. Order Fulfillment Status Series (Real Data)
    const statusColors: Record<string, string> = {
      DELIVERED: '#218838',
      SHIPPED: '#560067',
      PROCESSING: '#D8B878',
      PENDING: '#E6A23C',
      CANCELLED: '#DC3545',
      CONFIRMED: '#2878C7',
    };
    const statusCounts: Record<string, number> = {};
    for (const o of orders) {
      const st = (o.shippingStatus || 'PENDING').toUpperCase();
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    }
    const orderStatusSeries = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
      color: statusColors[name] || '#777078',
    }));

    // 3. Payment Method Breakdown (Real Data)
    let razorpayCount = 0;
    let razorpayAmount = 0;
    let codCount = 0;
    let codAmount = 0;
    for (const o of orders) {
      if (o.paymentMethod === 'RAZORPAY') {
        razorpayCount += 1;
        razorpayAmount += o.totalAmount || 0;
      } else {
        codCount += 1;
        codAmount += o.totalAmount || 0;
      }
    }
    const paymentMethodSeries = [
      { method: 'Razorpay', orders: razorpayCount, amount: razorpayAmount },
      { method: 'COD', orders: codCount, amount: codAmount },
    ];

    // 4. Category Performance (Real Data: Revenue from orders, or Stock Value if no orders yet)
    const catMap = new Map<string, { category: string; revenue: number; stock: number; sold: number }>();
    for (const p of products) {
      const catName = p.category?.name || 'Uncategorized';
      const existing = catMap.get(catName) || { category: catName, revenue: 0, stock: 0, sold: 0 };
      const soldQty = p.orderItems.reduce((s, item) => s + item.quantity, 0);
      existing.stock += p.stockQuantity ?? 0;
      existing.sold += soldQty;
      existing.revenue += soldQty * (p.price || 0);
      catMap.set(catName, existing);
    }
    const categorySeries = Array.from(catMap.values());

    // 5. Low Stock Products (Real Data)
    const lowStockProducts = products
      .filter((p) => (p.stockQuantity ?? 0) <= 5)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stockQuantity: p.stockQuantity ?? 0,
        primaryImage: p.primaryImage,
      }));

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers: customerCount,
        totalProducts: products.length,
        avgOrderValue,
        lowStockCount: lowStockProducts.length,
      },
      revenueSeries,
      orderStatusSeries,
      paymentMethodSeries,
      categorySeries,
      lowStockProducts,
    });
  } catch (error: any) {
    console.error('Overview analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
