import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRazorpayClient } from '@/lib/razorpay';
import { calculateShippingAndTax, isValidIndianMobile, isValidIndianPinCode } from '@/lib/india-localization';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      flatBuilding,
      streetArea,
      landmark,
      city,
      state,
      pinCode,
      paymentMethod,
      items,
      couponCode,
    } = body;

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Customer contact information is incomplete' }, { status: 400 });
    }

    if (!isValidIndianMobile(customerPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number (+91)' },
        { status: 400 }
      );
    }

    if (!isValidIndianPinCode(pinCode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit Indian PIN code' },
        { status: 400 }
      );
    }

    if (!flatBuilding || !streetArea || !city || !state) {
      return NextResponse.json({ error: 'Complete delivery address is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Server-side calculation & stock check
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subtotal = 0;
    const orderItemsData = [];
    const emailItems = [];

    for (const item of items) {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (!prod) {
        return NextResponse.json({ error: `Product not found` }, { status: 400 });
      }
      if (!prod.inStock || prod.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Sorry, "${prod.name}" is currently low in stock` },
          { status: 400 }
        );
      }
      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;
      orderItemsData.push({
        productId: prod.id,
        quantity: item.quantity,
        price: prod.price,
        wristSize: item.wristSize || 'Medium (7.0 in)',
      });
      emailItems.push({
        name: prod.name,
        quantity: item.quantity,
        price: prod.price,
      });
    }

    // Shipping config
    const shippingConfig = await prisma.shippingConfig.findFirst();
    const freeShippingThreshold = shippingConfig?.freeShippingThreshold ?? 999;
    const flatRate = shippingConfig?.flatRate ?? 79;
    const codFee = shippingConfig?.codFee ?? 49;
    const codEnabled = shippingConfig?.codEnabled ?? true;

    if (paymentMethod === 'COD' && !codEnabled) {
      return NextResponse.json({ error: 'Cash on Delivery is currently disabled' }, { status: 400 });
    }

    // Coupon verification
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive && subtotal >= coupon.minOrderValue) {
        discountAmount = Math.round((subtotal * coupon.discountPct) / 100);
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const calc = calculateShippingAndTax({
      subtotal: discountedSubtotal,
      paymentMethod,
      flatRate,
      freeShippingThreshold,
      codFee,
    });

    const orderNumber = `REHAS-IN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    let razorpayOrderId: string | null = null;
    let paymentStatus = 'PENDING';

    if (paymentMethod === 'RAZORPAY') {
      const rzp = getRazorpayClient();
      if (rzp) {
        const rzpOrder = await rzp.orders.create({
          amount: Math.round(calc.total * 100),
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            customerName,
            customerPhone,
            pinCode,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } else {
        razorpayOrderId = `order_sim_${Date.now()}`;
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        flatBuilding,
        streetArea,
        landmark: landmark || null,
        city,
        state,
        pinCode,
        subtotal,
        discountAmount,
        couponCode: couponCode ? couponCode.toUpperCase() : null,
        shippingFee: calc.shippingFee,
        taxAmount: calc.taxAmount,
        totalAmount: calc.total,
        paymentMethod,
        paymentStatus,
        razorpayOrderId,
        shippingStatus: 'PROCESSING',
        items: {
          create: orderItemsData,
        },
      },
    });

    // Send confirmation email asynchronously (Requirement 9)
    sendOrderConfirmationEmail({
      to: customerEmail,
      customerName,
      orderNumber,
      totalAmount: calc.total,
      items: emailItems,
      paymentMethod,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      order,
      razorpay: {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_RycgNUibMa94PO',
        orderId: razorpayOrderId,
        amount: Math.round(calc.total * 100),
        currency: 'INR',
        name: 'REHAS Sacred Merchandise',
        description: `Order ${orderNumber} - Consecrated Astrology Bracelets`,
      },
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process order' }, { status: 500 });
  }
}
