'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { formatINR } from '@/lib/india-localization';
import styles from '@/components/admin/common/AdminSection.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        if (data.products) setProducts(data.products);
      } catch (e) {
        console.error(e);
      }
    }
    fetchProducts();
  }, []);

  return (
    <AdminLayout pageTitle="Product Catalog" breadcrumb="REHAS / Catalog / Products">
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h2 className={styles.title}>Sacred Merchandise Collection</h2>
            <span className={styles.subTitle}>Manage spiritual merchandise, pricing, variants & stock</span>
          </div>

          <button className={styles.primaryBtn}>
            <AddCircleOutlineOutlinedIcon fontSize="small" />
            <span>Add New Product</span>
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No products found. Add your first sacred merchandise item.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.sku}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.category || 'Astrology'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(p.price)}</td>
                    <td>{p.stockQuantity ?? 12} units</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
