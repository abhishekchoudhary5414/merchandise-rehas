'use client';

import React from 'react';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import styles from './LowStockProducts.module.css';

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  primaryImage: string;
}

interface LowStockProductsProps {
  items: LowStockItem[];
  onUpdateStock: (productId: string) => void;
}

export default function LowStockProducts({ items, onUpdateStock }: LowStockProductsProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>
            <WarningAmberOutlinedIcon fontSize="small" style={{ color: 'var(--warning)' }} />
            Low Stock Alerts
          </h3>
          <span className={styles.subTitle}>Products with 5 or fewer units remaining</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          All products are well-stocked (more than 5 units available).
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.row}>
              <div className={styles.left}>
                <img
                  src={item.primaryImage || '/images/rehas-logo.png'}
                  alt={item.name}
                  className={styles.thumb}
                />
                <div>
                  <div className={styles.name}>{item.name}</div>
                  <div className={styles.sku}>{item.sku}</div>
                </div>
              </div>

              <div className={styles.right}>
                <span
                  className={`${styles.qtyBadge} ${
                    item.stockQuantity === 0 ? styles.qtyOut : ''
                  }`}
                >
                  {item.stockQuantity === 0 ? 'Out of Stock' : `${item.stockQuantity} left`}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateStock(item.id)}
                  className={styles.updateBtn}
                >
                  Update Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
