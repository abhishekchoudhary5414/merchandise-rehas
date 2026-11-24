'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, ShieldCheck } from 'lucide-react';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
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
  categoryName?: string;
  inStock: boolean;
}

export default function ProductCard({
  slug,
  name,
  price,
  compareAtPrice,
  primaryImage,
  rating,
  reviewCount,
  primaryCrystal,
  rulingPlanet,
  inStock,
}: ProductCardProps) {
  const discountPct = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Link href={`/product/${slug}`} className={styles.imageLink}>
          <img src={primaryImage} alt={name} className={styles.image} />
        </Link>

        {discountPct && (
          <span className={styles.discountBadge}>SAVE {discountPct}%</span>
        )}

        <button className={styles.wishlistBtn} aria-label="Add to Wishlist">
          <Heart size={16} />
        </button>

        <div className={styles.vedicTag}>
          <ShieldCheck size={12} /> Mantra Energized
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.metaRow}>
          {primaryCrystal && <span className={styles.crystal}>{primaryCrystal}</span>}
          {rulingPlanet && <span className={styles.planet}>🪐 {rulingPlanet}</span>}
        </div>

        <Link href={`/product/${slug}`} className={styles.titleLink}>
          <h3 className={styles.title}>{name}</h3>
        </Link>

        {reviewCount > 0 && (
          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={styles.starFill} />
              ))}
            </div>
            <span className={styles.ratingText}>{rating} ({reviewCount})</span>
          </div>
        )}

        <div className={styles.pricingRow}>
          <div>
            <span className={styles.currentPrice}>₹{price.toLocaleString('en-IN')}</span>
            {compareAtPrice && compareAtPrice > price && (
              <span className={styles.originalPrice}>₹{compareAtPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <span className={styles.taxNote}>Incl. GST</span>
        </div>

        <Link href={`/product/${slug}`} className={styles.quickAddBtn}>
          <ShoppingCart size={15} /> Select & Energize
        </Link>
      </div>
    </div>
  );
}
