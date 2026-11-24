'use client';

import React from 'react';
import styles from './SectionSkeleton.module.css';

interface SectionSkeletonProps {
  variant?: 'overview' | 'table' | 'form' | 'cards';
}

export default function SectionSkeleton({ variant = 'table' }: SectionSkeletonProps) {
  if (variant === 'overview') {
    return (
      <div className={styles.stack} aria-busy="true" aria-label="Loading dashboard overview">
        {/* Welcome Banner Skeleton */}
        <div className={styles.card} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
            <div className={styles.bone} style={{ height: '28px', width: '240px' }} />
            <div className={styles.bone} style={{ height: '16px', width: '320px', maxWidth: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className={styles.bone} style={{ height: '38px', width: '140px' }} />
            <div className={styles.bone} style={{ height: '38px', width: '130px' }} />
          </div>
        </div>

        {/* 4 KPI Cards Skeleton */}
        <div className={styles.kpiGrid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.kpiCard}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
                <div className={styles.bone} style={{ height: '12px', width: '90px' }} />
                <div className={styles.bone} style={{ height: '26px', width: '110px' }} />
                <div className={styles.bone} style={{ height: '12px', width: '130px' }} />
              </div>
              <div className={styles.bone} style={{ height: '48px', width: '48px' }} />
            </div>
          ))}
        </div>

        {/* 2 Chart Cards Skeleton */}
        <div className={styles.chartGrid}>
          {[0, 1].map((i) => (
            <div key={i} className={styles.card}>
              <div className={styles.bone} style={{ height: '20px', width: '180px', marginBottom: '0.5rem' }} />
              <div className={styles.bone} style={{ height: '12px', width: '220px', marginBottom: '1.25rem' }} />
              <div className={styles.bone} style={{ height: '240px', width: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className={styles.card} aria-busy="true" aria-label="Loading form section">
        <div className={styles.tableHeader}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className={styles.bone} style={{ height: '24px', width: '210px' }} />
            <div className={styles.bone} style={{ height: '14px', width: '280px' }} />
          </div>
          <div className={styles.bone} style={{ height: '36px', width: '120px' }} />
        </div>

        <div className={styles.formGrid}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div className={styles.bone} style={{ height: '14px', width: '110px' }} />
              <div className={styles.bone} style={{ height: '40px', width: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={styles.card} aria-busy="true" aria-label="Loading content section">
        <div className={styles.tableHeader}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className={styles.bone} style={{ height: '24px', width: '200px' }} />
            <div className={styles.bone} style={{ height: '14px', width: '270px' }} />
          </div>
          <div className={styles.bone} style={{ height: '36px', width: '130px' }} />
        </div>

        <div className={styles.stack} style={{ gap: '0.85rem' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.bone} style={{ height: '72px', width: '100%' }} />
          ))}
        </div>
      </div>
    );
  }

  // Default: 'table'
  return (
    <div className={styles.card} aria-busy="true" aria-label="Loading table section">
      <div className={styles.tableHeader}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div className={styles.bone} style={{ height: '24px', width: '220px' }} />
          <div className={styles.bone} style={{ height: '14px', width: '300px' }} />
        </div>
        <div className={styles.bone} style={{ height: '38px', width: '135px' }} />
      </div>

      <div className={styles.tableRows}>
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className={styles.tableRow}>
            <div className={styles.bone} style={{ height: '18px', width: '80%' }} />
            <div className={styles.bone} style={{ height: '18px', width: '90%' }} />
            <div className={styles.bone} style={{ height: '18px', width: '70%' }} />
            <div className={styles.bone} style={{ height: '18px', width: '60%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
