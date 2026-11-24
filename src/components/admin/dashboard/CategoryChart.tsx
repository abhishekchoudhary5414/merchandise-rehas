'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import styles from './CategoryChart.module.css';

export interface CategoryPoint {
  category: string;
  revenue: number;
  stock: number;
  sold: number;
}

export default function CategoryChart({ data = [] }: { data?: CategoryPoint[] }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Category Inventory &amp; Sales</h3>
          <span className={styles.subTitle}>Available stock vs units sold per category</span>
        </div>
      </div>

      <div className={styles.chartWrap}>
        {data.length === 0 ? (
          <div className={styles.empty}>
            No product categories found yet. Add products to visualize category performance.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9f2" />
              <XAxis dataKey="category" stroke="#777078" fontSize={12} />
              <YAxis stroke="#777078" fontSize={12} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="stock" name="Available Stock" fill="#560067" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sold" name="Units Sold" fill="#D8B878" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
