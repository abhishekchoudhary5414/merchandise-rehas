'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ShieldCheck, Flame, Compass, ArrowRight, Eye, ShoppingBag } from 'lucide-react';
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
  const [leadImgError, setLeadImgError] = useState(false);
  const featuredLead = products && products.length > 0 ? products[0] : null;
  const remainingProducts = products && products.length > 1 ? products.slice(1) : [];

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

        {/* Dynamic Display */}
        {featuredLead ? (
          <>
            {/* Interactive Spotlight Hero Card */}
            <div className={styles.spotlightCard}>
              <div className={styles.spotlightImageContainer}>
                <img
                  src={leadImgError ? '/images/rehas-logo.png' : (featuredLead.primaryImage || '/images/rehas-logo.png')}
                  alt={featuredLead.name}
                  className={styles.spotlightImg}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={() => setLeadImgError(true)}
                />
              </div>

              <div className={styles.spotlightContent}>
                <div className={styles.spotlightBadge}>
                  <Sparkles size={13} /> Sacred Arrival Spotlight
                </div>

                <h3 className={styles.spotlightTitle}>
                  <Link href={`/product/${featuredLead.slug}`}>
                    {featuredLead.name}
                  </Link>
                </h3>

                <div className={styles.spotlightMeta}>
                  {featuredLead.primaryCrystal && (
                    <span className={styles.spotlightMetaTag}>
                      💎 {featuredLead.primaryCrystal}
                    </span>
                  )}
                  {featuredLead.rulingPlanet && (
                    <span className={styles.spotlightMetaTag}>
                      🪐 {featuredLead.rulingPlanet}
                    </span>
                  )}
                  <span className={styles.spotlightMetaTag}>
                    <ShieldCheck size={13} color="#10B981" /> Vedic Consecrated
                  </span>
                </div>

                <div className={styles.spotlightPricing}>
                  <span className={styles.spotlightPrice}>
                    ₹{featuredLead.price.toLocaleString('en-IN')}
                  </span>
                  {featuredLead.compareAtPrice && featuredLead.compareAtPrice > featuredLead.price && (
                    <span className={styles.spotlightComparePrice}>
                      ₹{featuredLead.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className={styles.spotlightActions}>
                  <Link href={`/product/${featuredLead.slug}`} className={styles.spotlightActionBtn}>
                    <ShoppingBag size={16} /> Select & Energize Now
                  </Link>
                  <Link href={`/product/${featuredLead.slug}`} className={styles.spotlightSecondaryBtn}>
                    <Eye size={16} /> View Sacred Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Grid of remaining new arrivals */}
            {remainingProducts.length > 0 && (
              <div className={styles.productGrid}>
                {remainingProducts.map((prod) => (
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
            )}
          </>
        ) : (
          <div className={styles.emptyCard}>
            <p>New arrivals are being ritually consecrated. Please check back shortly.</p>
          </div>
        )}

        {/* Bottom Call to Action */}
        <div className={styles.footerCta}>
          <Link href="/shop" className={styles.exploreAllLink}>
            <span>Explore All Vedic Sacred Bracelets</span>
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
