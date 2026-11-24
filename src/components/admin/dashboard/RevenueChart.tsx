'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatINR } from '@/lib/india-localization';
import styles from './RevenueChart.module.css';

export interface RevenuePoint {
  day: string;
  revenue: number;
  orders?: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        <div className={styles.tooltipValue}>
          Revenue: <strong>{formatINR(payload[0].value)}</strong>
        </div>
        {payload[0].payload?.orders !== undefined && (
          <div className={styles.tooltipValue}>
            Orders: <strong>{payload[0].payload.orders}</strong>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function RevenueChart({ data = [] }: { data?: RevenuePoint[] }) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Revenue Performance (Last 7 Days)</h3>
          <span className={styles.subTitle}>Actual paid revenue in INR (₹) from Neon DB</span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {data.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Loading live revenue data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#560067" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#560067" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9f2" />
              <XAxis dataKey="day" stroke="#777078" fontSize={12} />
              <YAxis stroke="#777078" fontSize={12} tickFormatter={(val) => `₹${val}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#560067"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
