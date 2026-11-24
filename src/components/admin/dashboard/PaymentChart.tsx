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
} from 'recharts';
import { formatINR } from '@/lib/india-localization';
import styles from './CategoryChart.module.css';

export interface PaymentPoint {
  method: string;
  orders: number;
  amount: number;
}

export default function PaymentChart({ data = [] }: { data?: PaymentPoint[] }) {
  const hasOrders = data.some((d) => d.orders > 0);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Payment Method Breakdown</h3>
          <span className={styles.subTitle}>Razorpay Online vs Cash on Delivery (COD)</span>
        </div>
      </div>

      <div className={styles.chartWrap}>
        {!hasOrders ? (
          <div className={styles.empty}>
            No payment transactions recorded yet. Razorpay &amp; COD stats will appear here.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9f2" />
              <XAxis dataKey="method" stroke="#777078" fontSize={12} />
              <YAxis stroke="#777078" fontSize={12} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(val: any) => formatINR(Number(val) || 0)} />
              <Bar dataKey="amount" name="Order Value (INR)" fill="#560067" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
