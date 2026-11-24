'use client';

import React from 'react';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleIcon from '@mui/icons-material/People';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { formatINR } from '@/lib/india-localization';

import styles from './StatsCards.module.css';

interface StatsProps {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

export default function StatsCards({
  totalRevenue,
  totalOrders,
  totalCustomers,
  totalProducts,
}: StatsProps) {
  const cards = [
    {
      label: 'Total Revenue',
      value: formatINR(totalRevenue),
      subtext: '+14.2% vs last month',
      trend: true,
      icon: CurrencyRupeeIcon,
      bg: 'var(--primary-light)',
      color: 'var(--primary)',
    },
    {
      label: 'Total Orders',
      value: totalOrders.toString(),
      subtext: '+8.5% new orders',
      trend: true,
      icon: ShoppingBagIcon,
      bg: '#eff6ff',
      color: '#1d4ed8',
    },
    {
      label: 'Registered Customers',
      value: totalCustomers.toString(),
      subtext: 'Active boutique shoppers',
      trend: false,
      icon: PeopleIcon,
      bg: '#ecfdf5',
      color: '#047857',
    },
    {
      label: 'Active Products',
      value: totalProducts.toString(),
      subtext: 'Curated merchandise in stock',
      trend: false,
      icon: Inventory2Icon,
      bg: 'var(--secondary-light)',
      color: '#926c2e',
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className={styles.card}>
            <div className={styles.info}>
              <span className={styles.label}>{c.label}</span>
              <span className={styles.value}>{c.value}</span>
              <span className={styles.subtext}>
                {c.trend && <TrendingUpIcon fontSize="inherit" className={styles.trendUp} />}
                {c.subtext}
              </span>
            </div>

            <div className={styles.iconWrap} style={{ background: c.bg, color: c.color }}>
              <Icon fontSize="medium" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
