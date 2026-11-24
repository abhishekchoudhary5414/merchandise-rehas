import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import HeaderStickyGroup from '@/components/layout/HeaderStickyGroup';
import Hero from '@/components/hero/Hero';
import Categories from '@/components/categories/Categories';
import FeaturedCollections from '@/components/collections/FeaturedCollections';
import ProductCard from '@/components/products/ProductCard';
import AboutBrand from '@/components/about/AboutBrand';
import WhyUs from '@/components/why-us/WhyUs';
import Testimonials from '@/components/testimonials/Testimonials';
import InstagramGallery from '@/components/instagram/InstagramGallery';
import BlogSection from '@/components/blog/BlogSection';
import Newsletter from '@/components/newsletter/Newsletter';
import ContactSection from '@/components/contact/ContactSection';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import { generateOrganizationJsonLd } from '@/lib/seo-helpers';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let categories: any[] = [];
  let bestSellers: any[] = [];
  let newArrivals: any[] = [];
  let blogs: any[] = [];

  try {
    const res = await Promise.all([
      prisma.category.findMany().catch(() => []),
      prisma.product.findMany({
        where: { inStock: true, isBestSeller: true },
        take: 4,
      }).catch(() => []),
      prisma.product.findMany({
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }).catch(() => []),
      prisma.blog.findMany({
        where: { published: true },
        take: 2,
      }).catch(() => []),
    ]);
    categories = res[0];
    bestSellers = res[1];
    newArrivals = res[2];
    blogs = res[3];
  } catch (err) {
    console.error('Database fetch error on HomePage:', err);
  }

  const orgJsonLd = generateOrganizationJsonLd();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* Fixed Sticky Header Unit (Announcement Marquee + Navbar) */}
      <HeaderStickyGroup />

      {/* Main Content Area Padded Down to Account for Fixed Header */}
      <div style={{ paddingTop: '112px' }}>
        {/* C. Clean, Simple Hero Section */}
        <Hero />

        {/* D. Shop by Category (Horizontal on Mobile) */}
        <Categories categories={categories} />

        {/* E. Featured Collections */}
        <FeaturedCollections />

        {/* F. Best Sellers Section */}
        <section style={{ padding: '80px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '45px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--secondary)' }}>
                Astrologer Recommended
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 800, color: 'var(--primary)', margin: '8px 0 10px' }}>
                Most Revered Best Sellers
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
                These consecrated crystal bracelets have facilitated thousands of recorded breakthroughs across India in business, protection, and peace.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
              {bestSellers.map((prod) => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  slug={prod.slug}
                  name={prod.name}
                  price={prod.price}
                  compareAtPrice={prod.compareAtPrice}
                  primaryImage={prod.primaryImage}
                  rating={prod.rating}
                  reviewCount={prod.reviewCount}
                  primaryCrystal={prod.primaryCrystal}
                  rulingPlanet={prod.rulingPlanet}
                  inStock={prod.inStock}
                />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link href="/shop" className="brand-btn-primary">
                View All 12+ Sacred Bracelets →
              </Link>
            </div>
          </div>
        </section>

        {/* G. About Our Brand */}
        <AboutBrand />

        {/* H. New Arrivals */}
        <section style={{ padding: '80px 24px', background: 'var(--background)' }}>
          <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '45px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--secondary)' }}>
                Fresh Astrological Energies
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 800, color: 'var(--primary)', margin: '8px 0 10px' }}>
                Recently Consecrated Arrivals
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
              {newArrivals.map((prod) => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  slug={prod.slug}
                  name={prod.name}
                  price={prod.price}
                  compareAtPrice={prod.compareAtPrice}
                  primaryImage={prod.primaryImage}
                  rating={prod.rating}
                  reviewCount={prod.reviewCount}
                  primaryCrystal={prod.primaryCrystal}
                  rulingPlanet={prod.rulingPlanet}
                  inStock={prod.inStock}
                />
              ))}
            </div>
          </div>
        </section>

        {/* I. Why Choose Us */}
        <WhyUs />

        {/* J. Personalized Numerology Collection Section */}
        <section id="astrology" style={{ padding: '80px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--secondary)' }}>
              Mulank & Vedic Numerology
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 800, color: 'var(--primary)', margin: '8px 0 12px' }}>
              Find Your Birth Root Number (Mulank 1 - 9) Bracelet
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.6 }}>
              In Vedic wisdom, reducing your birth date day (e.g. 18th = 1+8 = 9) unlocks your primary planetary ruler. Wear the exact crystal that energizes your root numbers.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
              {[
                { num: 1, planet: 'Sun', stone: 'Tiger Eye & Ruby' },
                { num: 2, planet: 'Moon', stone: 'Moonstone & Pearl' },
                { num: 3, planet: 'Jupiter', stone: 'Citrine & Yellow Topaz' },
                { num: 4, planet: 'Rahu', stone: 'Hessonite & Sulemani' },
                { num: 5, planet: 'Mercury', stone: 'Green Aventurine' },
                { num: 6, planet: 'Venus', stone: 'Rose Quartz & Opal' },
                { num: 7, planet: 'Ketu', stone: 'Cats Eye & Obsidian' },
                { num: 8, planet: 'Saturn', stone: 'Amethyst & Blue Lace' },
                { num: 9, planet: 'Mars', stone: 'Hematite & Red Jasper' },
              ].map((m) => (
                <Link
                  key={m.num}
                  href={`/shop?mulank=${m.num}`}
                  style={{
                    background: 'var(--primary-light)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    textDecoration: 'none',
                    minWidth: '140px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(86,0,103,0.06)'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                    Mulank {m.num}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {m.planet}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--secondary)', marginTop: '4px', fontWeight: 600 }}>
                    {m.stone}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* K. Customer Testimonials */}
        <Testimonials />

        {/* L. Instagram Gallery */}
        <InstagramGallery />

        {/* M. Blog Section */}
        <BlogSection blogs={blogs} />

        {/* N. Newsletter */}
        <Newsletter />

        {/* O. Contact Section */}
        <ContactSection />

        {/* P. Footer */}
        <Footer />
      </div>

      {/* Q. WhatsApp Floating Button */}
      <WhatsAppFloat />
    </div>
  );
}
