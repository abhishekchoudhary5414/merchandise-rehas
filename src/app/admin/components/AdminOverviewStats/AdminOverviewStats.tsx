'use client';

import React from 'react';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { formatINR } from '@/lib/india-localization';
import styles from './AdminOverviewStats.module.css';

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: string;
}

interface OverviewStatsProps {
  orders: Order[];
  freeShippingThreshold: number;
}

export default function AdminOverviewStats({ orders, freeShippingThreshold }: OverviewStatsProps) {
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'PAID').length;

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIconWrap}>
          <ShoppingBagOutlinedIcon fontSize="medium" />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Total Orders</span>
          <span className={styles.statValue}>{orders.length}</span>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIconWrap} style={{ background: '#ecfdf5', color: '#047857' }}>
          <CurrencyRupeeIcon fontSize="medium" />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Paid Revenue</span>
          <span className={styles.statValue}>{formatINR(totalRevenue)}</span>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIconWrap} style={{ background: '#eff6ff', color: '#1d4ed8' }}>
          <CheckCircleOutlinedIcon fontSize="medium" />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Paid Orders</span>
          <span className={styles.statValue}>{paidOrdersCount}</span>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIconWrap} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
          <LocalShippingOutlinedIcon fontSize="medium" />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Free Ship Threshold</span>
          <span className={styles.statValue}>{formatINR(freeShippingThreshold)}</span>
        </div>
      </div>
    </div>
  );
}
