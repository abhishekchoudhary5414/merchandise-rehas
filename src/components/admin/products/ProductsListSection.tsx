'use client';

import React, { useState } from 'react';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCsv, exportToExcel } from '@/lib/export-utils';
import { formatINR } from '@/lib/india-localization';
import styles from './ProductsListSection.module.css';

interface ProductsListSectionProps {
  products: any[];
  onAddProduct: () => void;
  onEditProduct: (prod: any) => void;
  onDeleteProduct: (prod: any) => void;
  onUpdateProductStock?: (productId: string, newStock: number) => Promise<boolean>;
}

export default function ProductsListSection({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateProductStock,
}: ProductsListSectionProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  // Local draft stock values for inline editing
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});
  const [savingStockId, setSavingStockId] = useState<string | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (typeof p.category === 'object' && p.category?.name?.toLowerCase().includes(search.toLowerCase())) ||
    (typeof p.category === 'string' && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const totalItems = filtered.length;
  const effectivePageSize = pageSize === 'all' ? (totalItems || 1) : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginated = pageSize === 'all'
    ? filtered
    : filtered.slice((validCurrentPage - 1) * effectivePageSize, validCurrentPage * effectivePageSize);

  // Dynamic calculations: update immediately when any stock quantity is modified
  const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity ?? 0), 0);
  const inStockCount = products.filter((p) => (p.stockQuantity ?? 0) > 0).length;
  const lowStockCount = products.filter((p) => (p.stockQuantity ?? 0) <= 5).length;
  const uniqueCategoriesCount = new Set(
    products.map((p) => (typeof p.category === 'object' ? p.category?.name : p.category)).filter(Boolean)
  ).size;

  function handleExportCsv() {
    exportToCsv(
      ['SKU', 'Product Name', 'Category', 'Price (INR)', 'Total Stock', 'Status'],
      filtered.map((p) => [
        p.sku,
        p.name,
        typeof p.category === 'object' ? p.category?.name : (p.category || 'Astrology'),
        p.price,
        p.stockQuantity ?? 0,
        (p.stockQuantity ?? 0) > 0 ? 'Active' : 'Out of Stock',
      ]),
      'rehas-merchandise-collection.csv'
    );
  }

  function handleExportExcel() {
    exportToExcel(
      ['SKU', 'Product Name', 'Category', 'Price (INR)', 'Total Stock', 'Status'],
      filtered.map((p) => [
        p.sku,
        p.name,
        typeof p.category === 'object' ? p.category?.name : (p.category || 'Astrology'),
        p.price,
        p.stockQuantity ?? 0,
        (p.stockQuantity ?? 0) > 0 ? 'Active' : 'Out of Stock',
      ]),
      'rehas-merchandise-collection.xls'
    );
  }

  async function handleSaveStock(productId: string) {
    const draft = stockDrafts[productId];
    if (draft === undefined || draft < 0) return;
    setSavingStockId(productId);
    try {
      if (onUpdateProductStock) {
        await onUpdateProductStock(productId, draft);
      } else {
        const res = await fetch(`/api/admin/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stockQuantity: draft }),
        });
        if (!res.ok) throw new Error('Failed to update stock');
      }
      // Clear draft after successful update
      setStockDrafts((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert('Could not update stock quantity.');
    } finally {
      setSavingStockId(null);
    }
  }

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <span className={styles.vedicTagline}>
            <Inventory2Icon fontSize="inherit" />
            <span>Consecrated Merchandise Collection</span>
          </span>
          <h2 className={styles.mainTitle}>Sacred Merchandise Collection</h2>
          <p className={styles.mainSubtitle}>
            Manage consecrated gemstones, rudraksha bracelets, pricing, sacred energization &amp; catalog stock
          </p>
        </div>

        <div className={styles.controlsArea}>
          <div className={styles.topStockBadge}>
            <WarehouseOutlinedIcon fontSize="small" style={{ color: 'var(--primary)' }} />
            <span>Total Available Stock:</span>
            <strong>{totalStock} Units</strong>
          </div>

          <div className={styles.topExportGroup}>
            <span className={styles.topExportLabel}>Export:</span>
            <button type="button" onClick={handleExportCsv} className={styles.exportBtn}>
              CSV
            </button>
            <button type="button" onClick={handleExportExcel} className={styles.exportBtn}>
              Excel (XLSX)
            </button>
          </div>

          <button
            type="button"
            onClick={onAddProduct}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #3D0049 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(86, 0, 103, 0.2)',
            }}
          >
            <AddCircleOutlineOutlinedIcon fontSize="small" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className={styles.cardsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FAF5FC', color: 'var(--primary)' }}>
            <WarehouseOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Catalog Stock</span>
            <span className={styles.statValue}>{totalStock} Units</span>
            <span className={styles.statSub}>Combined stock across all products</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <CheckCircleOutlineOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active In-Stock Items</span>
            <span className={styles.statValue} style={{ color: '#16A34A' }}>
              {inStockCount} Products
            </span>
            <span className={styles.statSub}>Ready for patron checkout</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <WarningAmberOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Low Stock Alert</span>
            <span className={styles.statValue} style={{ color: '#D97706' }}>
              {lowStockCount} Products
            </span>
            <span className={styles.statSub}>5 or fewer units remaining</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FAF7FB', color: 'var(--secondary)' }}>
            <CategoryOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Collections</span>
            <span className={styles.statValue}>{uniqueCategoriesCount}</span>
            <span className={styles.statSub}>Sacred Vedic categories</span>
          </div>
        </div>
      </div>

      {/* 3. Controls & Search Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <SearchIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search merchandise by SKU, name or crystal type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 4. Product Catalog Table with Total Stock per product column */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item SKU</th>
                <th>Merchandise Item</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No sacred merchandise found matching search.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const currentStock = p.stockQuantity ?? 0;
                  const draftStock = stockDrafts[p.id];
                  const hasDraft = draftStock !== undefined && draftStock !== currentStock;
                  const isSaving = savingStockId === p.id;

                  return (
                    <tr key={p.id}>
                      <td>
                        <span className={styles.skuTag}>{p.sku}</span>
                      </td>
                      <td>
                        <div className={styles.itemCell}>
                          <img
                            src={p.primaryImage || '/images/rehas-logo.png'}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className={styles.itemThumb}
                          />
                          <div className={styles.itemDetails}>
                            <span className={styles.itemName}>{p.name}</span>
                            <span className={styles.itemSlug}>/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.categoryPill}>
                          {typeof p.category === 'object' ? p.category?.name : (p.category || 'Astrology')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                          {formatINR(p.price)}
                        </span>
                      </td>
                      <td>
                        {/* Total Stock column with direct update control */}
                        <div className={styles.stockCell}>
                          <input
                            type="number"
                            min={0}
                            value={draftStock !== undefined ? draftStock : currentStock}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setStockDrafts((prev) => ({
                                ...prev,
                                [p.id]: isNaN(val) ? 0 : val,
                              }));
                            }}
                            className={styles.stockInput}
                            title="Edit total stock for this product"
                          />
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>units</span>
                          {hasDraft && (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleSaveStock(p.id)}
                              className={styles.stockSaveBtn}
                              title="Save new stock and update total store stock"
                            >
                              {isSaving ? '...' : 'Save'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={currentStock > 0 ? styles.badgeSuccess : styles.badgeLow}>
                          {currentStock > 0 ? 'Active' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            style={{
                              background: '#FAF5FC',
                              color: 'var(--primary)',
                              border: '1px solid rgba(86, 0, 103, 0.2)',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <EditOutlinedIcon fontSize="inherit" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p)}
                            style={{
                              background: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <DeleteOutlinedIcon fontSize="inherit" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Custom Pagination */}
      <TablePagination
        totalItems={totalItems}
        pageSize={pageSize}
        currentPage={validCurrentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onExportCSV={handleExportCsv}
        onExportXLSX={handleExportExcel}
      />
    </div>
  );
}
