'use client';

import React, { useState, useEffect } from 'react';
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
  id,
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgSrc, setImgSrc] = useState(primaryImage || '/images/rehas-logo.png');

  useEffect(() => {
    setImgSrc(primaryImage || '/images/rehas-logo.png');
  }, [primaryImage]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
      if (Array.isArray(saved)) {
        setIsWishlisted(saved.some((item: any) => item.id === id || item.slug === slug));
      }
    } catch {
      // ignore
    }
  }, [id, slug]);

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
      let updated = [];
      if (isWishlisted) {
        updated = saved.filter((item: any) => item.id !== id && item.slug !== slug);
        setIsWishlisted(false);
      } else {
        updated = [
          ...saved,
          {
            id,
            name,
            slug,
            image: imgSrc,
            price,
          },
        ];
        setIsWishlisted(true);
      }
      localStorage.setItem('rehas_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('rehas_wishlist_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
  }

  const discountPct = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Link href={`/product/${slug}`} className={styles.imageLink}>
          <img
            src={imgSrc}
            alt={name}
            className={styles.image}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => {
              if (imgSrc !== '/images/rehas-logo.png') {
                setImgSrc('/images/rehas-logo.png');
              }
            }}
          />
        </Link>

        {discountPct && (
          <span className={styles.discountBadge}>SAVE {discountPct}%</span>
        )}

        <button
          className={styles.wishlistBtn}
          onClick={toggleWishlist}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          style={isWishlisted ? { color: '#E11D48', background: '#FFFFFF' } : {}}
        >
          <Heart size={16} fill={isWishlisted ? '#E11D48' : 'none'} />
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
