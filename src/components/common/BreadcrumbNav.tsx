'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';
import styles from './BreadcrumbNav.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

export default function BreadcrumbNav({
  items,
  showBackButton = true,
  backHref,
  backLabel = 'Back',
  rightSlot,
  className = '',
}: BreadcrumbNavProps) {
  const router = useRouter();

  function handleBack(e: React.MouseEvent) {
    if (backHref) return; // explicit URL provided
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <nav className={`${styles.navRow} ${className}`} aria-label="Breadcrumb navigation">
      <div className={styles.leftGroup}>
        {showBackButton && (
          backHref ? (
            <Link href={backHref} className={styles.backBtn} aria-label={backLabel}>
              <ArrowLeft size={14} />
              <span>{backLabel}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className={styles.backBtn}
              aria-label={backLabel}
            >
              <ArrowLeft size={14} />
              <span>{backLabel}</span>
            </button>
          )
        )}

        <ol className={styles.breadcrumbList}>
          <li className={styles.breadcrumbItem}>
            <Link href="/" className={styles.breadcrumbLink} aria-label="Home">
              <Home size={13} style={{ marginBottom: '1px' }} />
              <span>Home</span>
            </Link>
          </li>

          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className={styles.breadcrumbItem}>
                <span className={styles.separator} aria-hidden="true">
                  <ChevronRight size={13} />
                </span>
                {!isLast && item.href ? (
                  <Link href={item.href} className={styles.breadcrumbLink}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {rightSlot && <div className={styles.rightContent}>{rightSlot}</div>}
    </nav>
  );
}
