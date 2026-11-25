import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rehas_admin_jwt_secret_token_2026';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const slug = searchParams.get('slug');

    let targetProductId = productId;
    if (!targetProductId && slug) {
      const prod = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
      if (prod) targetProductId = prod.id;
    }

    if (!targetProductId) {
      return NextResponse.json({ error: 'productId or slug required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId: targetProductId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return NextResponse.json({
      success: true,
      reviews,
      totalReviews,
      averageRating,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value || cookieStore.get('token')?.value;

    let verifiedUserId: string | undefined = undefined;
    let authorName: string = 'Verified Customer';

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const lookupId = decoded?.userId || decoded?.id;
        if (lookupId && typeof lookupId === 'string') {
          const user = await prisma.user.findUnique({ where: { id: lookupId } });
          if (user) {
            verifiedUserId = user.id;
            authorName = user.name;
          }
        }
      } catch {
        // token invalid or expired
      }
    }

    const body = await req.json();
    const { productId, rating, comment, author, orderNumber } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!comment || comment.trim().length < 5) {
      return NextResponse.json({ error: 'Comment must be at least 5 characters long' }, { status: 400 });
    }

    // STRICT VERIFICATION: ONLY customers who received and had the product DELIVERED can review
    let deliveredOrder: any = null;

    if (verifiedUserId) {
      deliveredOrder = await prisma.order.findFirst({
        where: {
          userId: verifiedUserId,
          shippingStatus: 'DELIVERED',
          items: {
            some: { productId },
          },
        },
      });
    }

    if (!deliveredOrder && orderNumber) {
      deliveredOrder = await prisma.order.findFirst({
        where: {
          orderNumber: String(orderNumber).trim(),
          shippingStatus: 'DELIVERED',
          items: {
            some: { productId },
          },
        },
      });
    }

    if (!deliveredOrder) {
      return NextResponse.json(
        {
          error:
            'Only verified patrons who have purchased and received this product (order marked as DELIVERED) can submit a review. Please access your delivered order under Account Management to write a review.',
        },
        { status: 403 }
      );
    }

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: verifiedUserId || deliveredOrder.userId || null,
        author: author || authorName || deliveredOrder.customerName || 'Verified Patron',
        rating: Number(rating),
        comment: comment.trim(),
        verified: true,
      },
    });

    // Recalculate product rating & reviewCount
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });
    const newCount = allReviews.length;
    const newAvg = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1));

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: newAvg,
        reviewCount: newCount,
      },
    });

    return NextResponse.json({
      success: true,
      review: newReview,
      averageRating: newAvg,
      reviewCount: newCount,
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
