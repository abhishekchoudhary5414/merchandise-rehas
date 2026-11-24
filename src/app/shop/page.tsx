import React from 'react';
import { prisma } from '@/lib/prisma';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import ProductCard from '@/components/products/ProductCard';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import Link from 'next/link';

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    mulank?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, mulank, search, sort } = await searchParams;

  const where: any = { inStock: true };
  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }
  if (mulank) {
    where.mulankNumber = { contains: mulank };
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { primaryCrystal: { contains: search } },
      { description: { contains: search } },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy }),
    prisma.category.findMany(),
  ]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnnouncementBar />
      <Navbar />

      <main style={{ padding: '60px 24px', flex: 1, maxWidth: 'var(--container-width)', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--secondary)' }}>
            Sacred Merchandise Catalog
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 800, color: 'var(--primary)', margin: '8px 0 10px' }}>
            All Consecrated Crystal Bracelets ({products.length})
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Handcrafted with certified natural stones and pre-energized with Vedic rituals for prosperity, grounding, and evil eye protection.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '35px' }}>
          <Link
            href="/shop"
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              background: !category && !mulank ? 'var(--primary)' : 'var(--surface)',
              color: !category && !mulank ? '#ffffff' : 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            All Intentions
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                background: category === c.slug ? 'var(--primary)' : 'var(--surface)',
                color: category === c.slug ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '16px' }}>No bracelets match the selected astrological filter.</p>
            <Link href="/shop" className="brand-btn-primary" style={{ marginTop: '16px' }}>
              Reset Filters
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                compareAtPrice={p.compareAtPrice}
                primaryImage={p.primaryImage}
                rating={p.rating}
                reviewCount={p.reviewCount}
                primaryCrystal={p.primaryCrystal}
                rulingPlanet={p.rulingPlanet}
                inStock={p.inStock}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
