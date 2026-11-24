'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import styles from './RevenueChart.module.css';

export interface OrderStatusPoint {
  name: string;
  value: number;
  color: string;
}

export default function OrderChart({ data = [] }: { data?: OrderStatusPoint[] }) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Orders Fulfillment</h3>
          <span className={styles.subTitle}>Live order status breakdown</span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {data.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
            No orders placed yet. Order fulfillment status will visualize here automatically.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
