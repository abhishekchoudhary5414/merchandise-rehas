'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { formatINR } from '@/lib/india-localization';
import PopupModal, { PopupState } from '@/components/admin/common/PopupModal';
import styles from '@/components/admin/common/AdminSection.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [popup, setPopup] = useState<PopupState>({ open: false, type: 'info', title: '', message: '' });

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      } catch (e) {
        console.error(e);
      }
    }
    loadOrders();
  }, []);

  function handleRefund(orderId: string, amount: number) {
    setPopup({
      open: true,
      type: 'confirm',
      title: 'Confirm Razorpay Refund',
      message: `Are you sure you want to refund ${formatINR(amount)} via Razorpay?`,
      confirmLabel: 'Issue Refund',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/orders/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, amount, reason: 'Approved refund' }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Refund failed');
          setPopup({ open: true, type: 'success', title: 'Refund Completed', message: data.message || 'Refund completed' });
        } catch (e: any) {
          setPopup({ open: true, type: 'error', title: 'Refund Error', message: e.message || 'Refund failed' });
        }
      },
    });
  }

  return (
    <AdminLayout pageTitle="Customer Orders" breadcrumb="REHAS / Orders / All Orders">
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h2 className={styles.title}>All Store Orders</h2>
            <span className={styles.subTitle}>Manage fulfillment, payment records & returns</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{o.orderNumber}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{o.customerPhone}</div>
                    </td>
                    <td>{o.city}, {o.pinCode}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(o.totalAmount)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeActive}`}>
                        {o.paymentMethod} · {o.paymentStatus}
                      </span>
                    </td>
                    <td>{o.shippingStatus}</td>
                    <td>
                      {o.paymentStatus === 'PAID' && (
                        <button
                          onClick={() => handleRefund(o.id, o.totalAmount)}
                          style={{
                            background: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Issue Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PopupModal popup={popup} onClose={() => setPopup((p) => ({ ...p, open: false }))} />
    </AdminLayout>
  );
}
