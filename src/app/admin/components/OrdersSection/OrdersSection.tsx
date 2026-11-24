'use client';

import React, { useState } from 'react';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatINR } from '@/lib/india-localization';
import PopupModal, { PopupState } from '@/components/admin/common/PopupModal';
import styles from './OrdersSection.module.css';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  state: string;
  pinCode: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
  trackingNumber: string | null;
  createdAt: string;
}

interface OrdersSectionProps {
  orders: Order[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function OrdersSection({ orders, onRefresh, isLoading }: OrdersSectionProps) {
  const [popup, setPopup] = useState<PopupState>({ open: false, type: 'info', title: '', message: '' });

  function handleRefund(orderId: string, amount: number) {
    setPopup({
      open: true,
      type: 'confirm',
      title: 'Confirm Razorpay Refund',
      message: `Are you sure you want to refund ${formatINR(amount)} for this order via Razorpay?`,
      confirmLabel: 'Issue Refund',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/orders/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, amount, reason: 'Customer return approved' }),
          });
          const data = await res.json();
          if (res.ok) {
            setPopup({ open: true, type: 'success', title: 'Refund Issued', message: data.message || 'Refund issued successfully' });
            onRefresh();
          } else {
            setPopup({ open: true, type: 'error', title: 'Refund Failed', message: data.error || 'Refund failed' });
          }
        } catch (e: any) {
          setPopup({ open: true, type: 'error', title: 'Error', message: e.message });
        }
      },
    });
  }

  function getPaymentBadgeClass(status: string) {
    switch (status) {
      case 'PAID':
        return styles.statusPaid;
      case 'REFUNDED':
        return styles.statusRefunded;
      case 'FAILED':
        return styles.statusFailed;
      default:
        return styles.statusPending;
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>
          <LayersOutlinedIcon fontSize="medium" /> Customer Orders & Refunds
        </h2>

        <button onClick={onRefresh} disabled={isLoading} className={styles.refreshBtn}>
          <RefreshIcon fontSize="small" />
          Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No customer orders placed yet. Orders will appear here upon completion.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Delivery City / PIN</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Tracking</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{o.orderNumber}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.725rem' }}>{o.customerPhone}</div>
                  </td>
                  <td>
                    {o.pinCode}, {o.city}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatINR(o.totalAmount)}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getPaymentBadgeClass(o.paymentStatus)}`}>
                      {o.paymentMethod} · {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={styles.statusBadge} style={{ background: '#f4ede4', color: 'var(--foreground)' }}>
                      {o.shippingStatus}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                    {o.trackingNumber || 'Awaiting dispatch'}
                  </td>
                  <td>
                    {o.paymentStatus === 'PAID' && (
                      <button
                        onClick={() => handleRefund(o.id, o.totalAmount)}
                        className={styles.refundBtn}
                      >
                        <ReplayOutlinedIcon fontSize="small" /> Issue Refund
                      </button>
                    )}
                    {o.paymentStatus === 'REFUNDED' && (
                      <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                        Refunded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PopupModal popup={popup} onClose={() => setPopup((p) => ({ ...p, open: false }))} />
    </div>
  );
}
