'use client';

import React from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RevenueChart, { RevenuePoint } from '@/components/admin/dashboard/RevenueChart';
import OrderChart, { OrderStatusPoint } from '@/components/admin/dashboard/OrderChart';
import CategoryChart, { CategoryPoint } from '@/components/admin/dashboard/CategoryChart';
import PaymentChart, { PaymentPoint } from '@/components/admin/dashboard/PaymentChart';
import { exportToCsv, exportToExcel } from '@/lib/export-utils';
import { formatINR } from '@/lib/india-localization';
import styles from './AnalyticsSection.module.css';

interface AnalyticsSectionProps {
  overviewData: {
    kpis: {
      totalRevenue: number;
      totalOrders: number;
      totalCustomers: number;
      totalProducts: number;
      avgOrderValue: number;
      lowStockCount: number;
    };
    revenueSeries: RevenuePoint[];
    orderStatusSeries: OrderStatusPoint[];
    paymentMethodSeries: PaymentPoint[];
    categorySeries: CategoryPoint[];
  } | null;
}

export default function AnalyticsSection({ overviewData }: AnalyticsSectionProps) {
  const kpis = overviewData?.kpis || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    lowStockCount: 0,
  };

  function handleExportCsv() {
    exportToCsv(
      ['Date / Category', 'Turnover (INR)', 'Orders Count'],
      (overviewData?.revenueSeries || []).map((r) => [r.day, r.revenue ?? 0, r.orders ?? 0]),
      'rehas-store-sales-analytics.csv'
    );
  }

  function handleExportExcel() {
    exportToExcel(
      ['Date / Category', 'Turnover (INR)', 'Orders Count'],
      (overviewData?.revenueSeries || []).map((r) => [r.day, r.revenue ?? 0, r.orders ?? 0]),
      'rehas-store-sales-analytics.xls'
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <span className={styles.vedicTagline}>
            <AssessmentIcon fontSize="inherit" />
            <span>Store Performance &amp; Revenue Velocity</span>
          </span>
          <h2 className={styles.mainTitle}>Store Sales Analytics</h2>
          <p className={styles.mainSubtitle}>
            Live financial turnover, average cart value, order fulfillment breakdown &amp; payment method distribution
          </p>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Export:
          </span>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(86, 0, 103, 0.2)',
              background: '#FAF7FB',
              color: 'var(--primary)',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            CSV
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(86, 0, 103, 0.2)',
              background: '#FAF7FB',
              color: 'var(--primary)',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Excel (XLSX)
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: '#FAF5FC', color: 'var(--primary)' }}>
            <CurrencyRupeeIcon />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Total Realized Turnover</span>
            <span className={styles.metricValue}>{formatINR(kpis.totalRevenue)}</span>
            <span className={styles.metricSub}>From confirmed paid orders</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <TrendingUpIcon />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Average Order Value (AOV)</span>
            <span className={styles.metricValue}>{formatINR(kpis.avgOrderValue)}</span>
            <span className={styles.metricSub}>Per completed checkout</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <ShoppingBagIcon />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Total Placed Orders</span>
            <span className={styles.metricValue} style={{ color: '#16A34A' }}>{kpis.totalOrders}</span>
            <span className={styles.metricSub}>Across all fulfillment states</span>
          </div>
        </div>
      </div>

      {/* 3. Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <RevenueChart data={overviewData?.revenueSeries || []} />
        <OrderChart data={overviewData?.orderStatusSeries || []} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <CategoryChart data={overviewData?.categorySeries || []} />
        <PaymentChart data={overviewData?.paymentMethodSeries || []} />
      </div>
    </div>
  );
}
