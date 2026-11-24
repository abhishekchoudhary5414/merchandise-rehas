'use client';

import React from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import styles from '@/components/admin/common/AdminSection.module.css';

export default function CustomersPage() {
  const dummyCustomers = [
    { id: '1', name: 'Abhishek Sharma', email: 'merchandise.rehas@gmail.com', phone: '+91 98765 43210', orders: 3, spent: 4497 },
  ];

  return (
    <AdminLayout pageTitle="Customer Directory" breadcrumb="REHAS / Customers">
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h2 className={styles.title}>Registered Boutique Patrons</h2>
            <span className={styles.subTitle}>Customer profiles, contact data & purchase history</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {dummyCustomers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.orders} orders</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{c.spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
