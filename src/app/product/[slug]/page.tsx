import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import ProductDetailClient from './ProductDetailClient';
import {
  buildProductMetadata,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  SITE_URL,
} from '@/lib/seo-helpers';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return buildProductMetadata(product as any);
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true,
      images: true,
      reviews: true,
    },
  });

  if (!product) notFound();

  // Ensure new schema columns (rootPrice, auraPrice, divinePrice, energyRitual, structuredContent)
  // are always loaded even if next dev holds a stale PrismaClient singleton
  let enrichedProduct: any = { ...product };
  try {
    const extraRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT "rootPrice", "auraPrice", "divinePrice", "energyRitualPrice", "energyRitualDesc", "structuredContent" FROM "Product" WHERE id = $1 LIMIT 1`,
      product.id
    );
    if (extraRows && extraRows[0]) {
      enrichedProduct = {
        ...enrichedProduct,
        rootPrice: extraRows[0].rootPrice ?? enrichedProduct.rootPrice ?? null,
        auraPrice: extraRows[0].auraPrice ?? enrichedProduct.auraPrice ?? null,
        divinePrice: extraRows[0].divinePrice ?? enrichedProduct.divinePrice ?? null,
        energyRitualPrice: extraRows[0].energyRitualPrice ?? enrichedProduct.energyRitualPrice ?? null,
        energyRitualDesc: extraRows[0].energyRitualDesc ?? enrichedProduct.energyRitualDesc ?? null,
        structuredContent: extraRows[0].structuredContent ?? enrichedProduct.structuredContent ?? null,
      };
    }
  } catch (err) {
    console.warn('Extra product columns fetch note:', err);
  }

  let freeShippingThreshold = 999;
  try {
    const shipping = await prisma.shippingConfig.findFirst();
    if (shipping && typeof shipping.freeShippingThreshold === 'number') {
      freeShippingThreshold = shipping.freeShippingThreshold;
    }
  } catch (err) {
    console.warn('Shipping settings fetch note:', err);
  }

  const productJsonLd = generateProductJsonLd(enrichedProduct as any);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: SITE_URL },
    { name: product.category.name, url: `${SITE_URL}/shop?category=${product.category.slug}` },
    { name: product.name, url: `${SITE_URL}/product/${product.slug}` },
  ]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FAF8FB',
        backgroundImage:
          'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(86, 0, 103, 0.045) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, #FAF8FB 40%, #F7F4F9 100%)',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <AnnouncementBar />
      <Navbar />

      <ProductDetailClient
        product={JSON.parse(JSON.stringify(enrichedProduct))}
        freeShippingThreshold={freeShippingThreshold}
      />

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
