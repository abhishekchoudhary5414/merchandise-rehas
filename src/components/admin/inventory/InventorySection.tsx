'use client';

import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  ShoppingBag,
  RotateCcw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  Sparkles,
  Edit,
  Download,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCSV, exportToXLSX } from '@/lib/export-utils';
import styles from './InventorySection.module.css';

interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  primaryImage?: string;
  category?: { name: string };
  price: number;
  stockQuantity: number;
  availableStock: number;
  soldCount: number;
  cancelledCount: number;
  refundedCount: number;
}

interface InventorySectionProps {
  onEditProduct?: (product: any) => void;
}

export default function InventorySection({ onEditProduct }: InventorySectionProps) {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filtered = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  });

  // Export handlers
  function handleExportCSV() {
    const headers = ['SKU', 'Item Name', 'Category', 'Active Sold', 'Available Stock', 'Cancelled Orders', 'Refunded Units', 'Status'];
    const rows = filtered.map((p) => [
      p.sku,
      p.name,
      p.category?.name || 'Vedic Bracelets',
      p.soldCount || 0,
      p.stockQuantity ?? 0,
      p.cancelledCount || 0,
      p.refundedCount || 0,
      (p.stockQuantity ?? 0) === 0 ? 'Out of Stock' : (p.stockQuantity ?? 0) <= 5 ? 'Low Stock' : 'In Stock',
    ]);
    exportToCSV('REHAS_Inventory_Report', headers, rows);
  }

  function handleExportXLSX() {
    const headers = ['SKU', 'Item Name', 'Category', 'Active Sold', 'Available Stock', 'Cancelled Orders', 'Refunded Units', 'Status'];
    const rows = filtered.map((p) => [
      p.sku,
      p.name,
      p.category?.name || 'Vedic Bracelets',
      p.soldCount || 0,
      p.stockQuantity ?? 0,
      p.cancelledCount || 0,
      p.refundedCount || 0,
      (p.stockQuantity ?? 0) === 0 ? 'Out of Stock' : (p.stockQuantity ?? 0) <= 5 ? 'Low Stock' : 'In Stock',
    ]);
    exportToXLSX('REHAS_Inventory_Report', headers, rows);
  }

  // Pagination slice
  const totalItems = filtered.length;
  const pagedProducts =
    pageSize === 'all'
      ? filtered
      : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Overall metric totals
  const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity ?? 0), 0);
  const totalSold = products.reduce((sum, p) => sum + (p.soldCount || 0), 0);
  const totalCancelled = products.reduce((sum, p) => sum + (p.cancelledCount || 0), 0);
  const totalRefunded = products.reduce((sum, p) => sum + (p.refundedCount || 0), 0);

  return (
    <div className={styles.container}>
      {/* Banner Header with Vedic Theme */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <div className={styles.vedicTagline}>
            <Sparkles size={13} color="#D8B878" />
            <span>Atelier Inventory Control</span>
          </div>
          <h2 className={styles.mainTitle}>Inventory & Stock Movement</h2>
          <p className={styles.mainSubtitle}>
            Live stock balances, realized sales, and restored units from cancelled & refunded orders
          </p>
        </div>

        <div className={styles.controlsArea}>
          {/* Prominent Total Stocks Counter Badge */}
          <div className={styles.topStockBadge}>
            <Warehouse size={15} color="var(--primary)" />
            <span>Total Available Stock:</span>
            <strong>{loading ? '...' : `${totalStock} Units`}</strong>
          </div>

          {/* Top Export Group */}
          <div className={styles.topExportGroup}>
            <span className={styles.topExportLabel}>Export:</span>
            <button
              type="button"
              onClick={handleExportCSV}
              className={styles.topExportBtn}
              title="Download Inventory CSV"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportXLSX}
              className={`${styles.topExportBtn} ${styles.topExportXlsx}`}
              title="Download Inventory Excel (XLSX)"
            >
              <FileSpreadsheet size={13} />
              <span>Excel (XLSX)</span>
            </button>
          </div>

          <div className={styles.searchWrap}>
            <Search size={16} color="var(--primary)" />
            <input
              type="text"
              placeholder="Search by SKU, bracelet name, stone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={loadInventory}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Stock'}</span>
          </button>
        </div>
      </div>

      {/* Metric Pills Row */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FAF5FC', color: 'var(--primary)' }}>
            <Warehouse size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Available Stock</span>
            <span className={styles.summaryPillValue}>{loading ? '...' : totalStock}</span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Units Sold</span>
            <span className={styles.summaryPillValue} style={{ color: '#059669' }}>
              {loading ? '...' : totalSold}
            </span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FFF1F2', color: '#E11D48' }}>
            <RotateCcw size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Refund Restores</span>
            <span className={styles.summaryPillValue} style={{ color: '#E11D48' }}>
              {loading ? '...' : totalRefunded}
            </span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FEF2F2', color: '#DC2626' }}>
            <XCircle size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Cancelled Orders</span>
            <span className={styles.summaryPillValue} style={{ color: '#DC2626' }}>
              {loading ? '...' : totalCancelled}
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Table Card with Pagination */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.directoryTable}>
            <thead>
              <tr>
                <th>Item SKU</th>
                <th>Merchandise Item</th>
                <th>Sold</th>
                <th>Available Stock</th>
                <th>Cancel</th>
                <th>Refund</th>
                <th>Stock Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((n) => (
                  <tr key={`skel-inv-${n}`} className={styles.tableRow}>
                    <td><div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '100px' }} /></td>
                    <td><div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '180px' }} /></td>
                    <td><div className={`${styles.skelPill} ${styles.skeletonShimmer}`} /></td>
                    <td><div className={`${styles.skelPill} ${styles.skeletonShimmer}`} /></td>
                    <td><div className={`${styles.skelPill} ${styles.skeletonShimmer}`} /></td>
                    <td><div className={`${styles.skelPill} ${styles.skeletonShimmer}`} /></td>
                    <td><div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '90px' }} /></td>
                    <td><div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '60px' }} /></td>
                  </tr>
                ))
              ) : pagedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyTitle}>No Inventory Items Found</div>
                      <p>No products match your current search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedProducts.map((p) => {
                  const qty = p.stockQuantity ?? 0;
                  const statusLabel = qty === 0 ? 'Out of Stock' : qty <= 5 ? 'Low Stock' : 'In Stock';
                  const statusClass = qty === 0 ? styles.stockOut : qty <= 5 ? styles.stockLow : styles.stockIn;

                  return (
                    <tr key={p.id} className={styles.tableRow}>
                      {/* SKU */}
                      <td><span className={styles.skuBadge}>{p.sku}</span></td>

                      {/* Product Name & Category */}
                      <td>
                        <div className={styles.productCell}>
                          {p.primaryImage && (
                            <img
                              src={p.primaryImage}
                              alt={p.name}
                              className={styles.productThumb}
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/rehas-logo.png'; }}
                            />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span className={styles.productName}>{p.name}</span>
                            <span className={styles.categoryTag}>{p.category?.name || 'Sacred Gemstones'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Sold Count */}
                      <td>
                        <strong style={{ color: p.soldCount > 0 ? '#059669' : 'var(--text-tertiary)' }}>
                          {p.soldCount || 0} sold
                        </strong>
                      </td>

                      {/* Available Stock */}
                      <td>
                        <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>
                          {qty} units
                        </strong>
                      </td>

                      {/* Cancel Column */}
                      <td>
                        {p.cancelledCount > 0 ? (
                          <span style={{ color: '#DC2626', fontWeight: 700, background: '#FEF2F2', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FECACA' }}>
                            ✕ {p.cancelledCount} cancelled
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>0</span>
                        )}
                      </td>

                      {/* Refund Column */}
                      <td>
                        {p.refundedCount > 0 ? (
                          <span style={{ color: '#E11D48', fontWeight: 700, background: '#FFF1F2', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FECDD3' }}>
                            ✓ {p.refundedCount} restored
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>0</span>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td>
                        <span className={`${styles.stockBadge} ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* Action */}
                      <td>
                        {onEditProduct && (
                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            className={styles.actionEditBtn}
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination & CSV/XLSX Export Bar */}
        <TablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onExportCSV={handleExportCSV}
          onExportXLSX={handleExportXLSX}
        />
      </div>
    </div>
  );
}
