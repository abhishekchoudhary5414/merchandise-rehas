'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/india-localization';
import styles from './RecentOrders.module.css';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  pinCode: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
  createdAt: string;
}

export default function RecentOrders({ orders }: { orders: OrderItem[] }) {
  const displayOrders = orders.slice(0, 5);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Customer Orders</h3>
        <Link href="/admin/orders" className={styles.viewAllLink}>
          View All Orders →
        </Link>
      </div>

      {displayOrders.length === 0 ? (
        <div className={styles.emptyState}>
          No orders received yet. Placed orders will appear here in real-time.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Destination</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((o) => (
                <tr key={o.id}>
                  <td className={styles.orderNumber}>{o.orderNumber}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                      {o.customerPhone}
                    </div>
                  </td>
                  <td>
                    {o.city}, {o.pinCode}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatINR(o.totalAmount)}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        o.paymentStatus === 'PAID' ? styles.badgePaid : styles.badgePending
                      }`}
                    >
                      {o.paymentMethod} · {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeShipped}`}>
                      {o.shippingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
