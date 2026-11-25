'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  SlidersHorizontal, 
  X, 
  Check, 
  Sparkles, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import styles from './ShopMobileFilter.module.css';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ShopMobileFilterProps {
  categories: CategoryItem[];
  totalCount: number;
  currentCategory?: string;
  currentMulank?: string;
  currentPriceRange?: string;
  currentSort?: string;
  currentSearch?: string;
}

export default function ShopMobileFilter({
  categories,
  totalCount,
  currentCategory,
  currentMulank,
  currentPriceRange,
  currentSort,
  currentSearch,
}: ShopMobileFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const activeFiltersCount = [
    currentCategory,
    currentMulank,
    currentPriceRange,
  ].filter(Boolean).length;

  function buildUrl(overrides: Record<string, string | null>) {
    const q = new URLSearchParams();
    if (currentCategory) q.set('category', currentCategory);
    if (currentMulank) q.set('mulank', currentMulank);
    if (currentSearch) q.set('search', currentSearch);
    if (currentSort && currentSort !== 'popular') q.set('sort', currentSort);
    if (currentPriceRange) q.set('priceRange', currentPriceRange);

    Object.entries(overrides).forEach(([key, val]) => {
      if (val === null) {
        q.delete(key);
      } else {
        q.set(key, val);
      }
    });

    const qs = q.toString();
    return qs ? `/shop?${qs}` : '/shop';
  }

  return (
    <>
      {/* Floating Bottom Bar for Mobile View Only */}
      <div className={styles.mobileBottomBar}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={styles.filterTriggerBtn}
          aria-label="Open Filters"
        >
          <SlidersHorizontal size={17} />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className={styles.activeCountBadge}>{activeFiltersCount}</span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <Link href="/shop" className={styles.quickResetBtn}>
            <RotateCcw size={14} />
            <span>Reset</span>
          </Link>
        )}
      </div>

      {/* Backdrop */}
      <div 
        className={isOpen ? styles.backdropActive : styles.backdrop}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding Drawer from RIGHT SIDE (as requested) */}
      <aside 
        className={isOpen ? styles.drawerOpen : styles.drawerClosed}
        aria-label="Filter Options"
      >
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerTitleWrap}>
            <SlidersHorizontal size={18} color="var(--primary)" />
            <h2 className={styles.drawerTitle}>Filter Bracelets</h2>
            <span className={styles.itemCount}>({totalCount})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeFiltersCount > 0 && (
              <Link 
                href="/shop" 
                onClick={() => setIsOpen(false)} 
                className={styles.headerResetLink}
              >
                Clear All
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={styles.drawerCloseBtn}
              aria-label="Close Filters"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className={styles.drawerBody}>
          {/* Categories */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Sacred Intention &amp; Category</h3>
            <div className={styles.categoryList}>
              <Link
                href={buildUrl({ category: null, page: '1' })}
                onClick={() => setIsOpen(false)}
                className={`${styles.categoryPill} ${!currentCategory ? styles.categoryPillActive : ''}`}
              >
                <span>All Intentions</span>
                {!currentCategory && <Check size={14} />}
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={buildUrl({ category: c.slug, page: '1' })}
                  onClick={() => setIsOpen(false)}
                  className={`${styles.categoryPill} ${currentCategory === c.slug ? styles.categoryPillActive : ''}`}
                >
                  <span>{c.name}</span>
                  {currentCategory === c.slug && <Check size={14} />}
                </Link>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Price (₹ INR)</h3>
            <div className={styles.priceList}>
              {[
                { label: 'Any Price', val: null },
                { label: 'Under ₹1,000', val: 'under-1000' },
                { label: '₹1,000 - ₹1,500', val: '1000-1500' },
                { label: '₹1,500 - ₹2,000', val: '1500-2000' },
                { label: 'Over ₹2,000', val: 'above-2000' },
              ].map((p, idx) => {
                const isActive = p.val === currentPriceRange || (!p.val && !currentPriceRange);
                return (
                  <Link
                    key={idx}
                    href={buildUrl({ priceRange: p.val, page: '1' })}
                    onClick={() => setIsOpen(false)}
                    className={`${styles.priceOption} ${isActive ? styles.priceOptionActive : ''}`}
                  >
                    <span>{p.label}</span>
                    {isActive && <Check size={14} />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sanctum note */}
          <div className={styles.sanctumNote}>
            <div className={styles.sanctumHeader}>
              <Sparkles size={14} color="#D8B878" />
              <span>Patna Consecration Sanctum</span>
            </div>
            <p className={styles.sanctumText}>
              All items are energized with Vedic Beej Mantras and certified for sacred spiritual usage.
            </p>
          </div>
        </div>

        {/* Drawer Footer CTA */}
        <div className={styles.drawerFooter}>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={styles.applyBtn}
          >
            <span>Apply Filters ({totalCount} items)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
