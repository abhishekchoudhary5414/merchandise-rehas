'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Flame, Compass, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import styles from './NewArrivalsSection.module.css';

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  primaryImage: string;
  rating: number;
  reviewCount: number;
  primaryCrystal: string | null;
  rulingPlanet: string | null;
  inStock: boolean;
}

interface NewArrivalsSectionProps {
  products: ProductItem[];
}

export default function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  const displayProducts = (products || []).slice(0, 4);

  return (
    <section className={styles.section} id="consecrated-arrivals">
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        {/* Header Block */}
        <div className={styles.headerBlock}>
          <div className={styles.vedicBadge}>
            <span className={styles.consecratedPulse} />
            <Sparkles size={14} color="#D8B878" />
            <span>Fresh Astrological Energies</span>
          </div>

          <h2 className={styles.heading}>
            Recently <span className={styles.headingHighlight}>Consecrated</span> Arrivals
          </h2>

          <p className={styles.subheading}>
            Handcrafted with authentic natural gemstones and energized in sacred Vedic rituals 
            for planetary alignment, spiritual balance, and divine protection.
          </p>

          {/* Quick Vedic Trust Pills */}
          <div className={styles.trustPillsRow}>
            <div className={styles.trustPill}>
              <ShieldCheck size={14} color="#560067" />
              <span>100% Certified Crystals</span>
            </div>
            <div className={styles.trustPill}>
              <Flame size={14} color="#D8B878" />
              <span>Prana-Pratishtha Consecrated</span>
            </div>
            <div className={styles.trustPill}>
              <Compass size={14} color="#560067" />
              <span>Planetary Ruling Alignment</span>
            </div>
          </div>
        </div>

        {/* 4-Column Product Grid */}
        {displayProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {displayProducts.map((prod) => (
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
        ) : (
          <div className={styles.emptyCard}>
            <p>New arrivals are being ritually consecrated. Please check back shortly.</p>
          </div>
        )}

        {/* Bottom Call to Action */}
        <div className={styles.footerCta}>
          <Link href="/shop" className={styles.exploreAllLink}>
            <span>Show More</span>
            <ArrowRight size={17} />
          </Link>
          <div className={styles.consecrationNotice}>
            <ShieldCheck size={14} color="#D8B878" />
            <span>Each order undergoes individual Pran-Pratishtha energization with your name & Gotra</span>
          </div>
        </div>
      </div>
    </section>
  );
}
