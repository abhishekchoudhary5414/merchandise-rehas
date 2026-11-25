'use client';

import React, { useState } from 'react';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCsv, exportToExcel } from '@/lib/export-utils';
import { formatINR } from '@/lib/india-localization';
import styles from '@/components/admin/inventory/InventorySection.module.css';

interface CouponsSectionProps {
  coupons: any[];
  loadingCoupons: boolean;
  onRefresh: () => void;
  onCreateCoupon: (e: React.FormEvent) => void;
  onToggleCoupon: (coupon: any) => void;
  onDeleteCoupon: (coupon: any) => void;
  showCouponForm: boolean;
  setShowCouponForm: React.Dispatch<React.SetStateAction<boolean>>;
  savingCoupon: boolean;
  newCoupon: {
    code: string;
    discountPct: string;
    minOrderValue: string;
    maxDiscount: string;
    isActive: boolean;
  };
  setNewCoupon: React.Dispatch<React.SetStateAction<any>>;
}

export default function CouponsSection({
  coupons,
  loadingCoupons,
  onRefresh,
  onCreateCoupon,
  onToggleCoupon,
  onDeleteCoupon,
  showCouponForm,
  setShowCouponForm,
  savingCoupon,
  newCoupon,
  setNewCoupon,
}: CouponsSectionProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filtered.length;
  const effectivePageSize = pageSize === 'all' ? (totalItems || 1) : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginated = pageSize === 'all'
    ? filtered
    : filtered.slice((validCurrentPage - 1) * effectivePageSize, validCurrentPage * effectivePageSize);

  function handleExportCsv() {
    exportToCsv(
      ['Coupon Code', 'Discount (%)', 'Min Order (INR)', 'Max Discount (INR)', 'Status'],
      filtered.map((c) => [c.code, `${c.discountPct}%`, c.minOrderValue, c.maxDiscount || 'No Cap', c.isActive ? 'Active' : 'Inactive']),
      'rehas-coupons.csv'
    );
  }

  function handleExportExcel() {
    exportToExcel(
      ['Coupon Code', 'Discount (%)', 'Min Order (INR)', 'Max Discount (INR)', 'Status'],
      filtered.map((c) => [c.code, `${c.discountPct}%`, c.minOrderValue, c.maxDiscount || 'No Cap', c.isActive ? 'Active' : 'Inactive']),
      'rehas-coupons.xls'
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <span className={styles.vedicTagline}>
            <ConfirmationNumberIcon fontSize="inherit" />
            <span>Store Promotions &amp; Patron Privileges</span>
          </span>
          <h2 className={styles.mainTitle}>Coupons &amp; Promotional Discounts</h2>
          <p className={styles.mainSubtitle}>
            Configure percentage-off vouchers, order spend minimums &amp; maximum discount caps
          </p>
        </div>

        <div className={styles.controlsArea}>
          <div className={styles.topStockBadge}>
            <span>Active Coupons:</span>
            <strong>{coupons.filter((c) => c.isActive).length} Active</strong>
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
            onClick={onRefresh}
            disabled={loadingCoupons}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              background: '#FAF7FB',
              border: '1px solid rgba(86, 0, 103, 0.2)',
              borderRadius: '10px',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <RefreshIcon fontSize="small" />
            <span>{loadingCoupons ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCouponForm((v) => !v)}
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
            <span>{showCouponForm ? 'Close Form' : 'Create Coupon'}</span>
          </button>
        </div>
      </div>

      {/* 2. Create Coupon Form */}
      {showCouponForm && (
        <form
          onSubmit={onCreateCoupon}
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(86, 0, 103, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            boxShadow: '0 4px 16px rgba(86, 0, 103, 0.06)',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Coupon Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SHIVA15"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Discount (%) *
            </label>
            <input
              type="number"
              required
              min={1}
              max={90}
              value={newCoupon.discountPct}
              onChange={(e) => setNewCoupon({ ...newCoupon, discountPct: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Min Order (₹)
            </label>
            <input
              type="number"
              min={0}
              value={newCoupon.minOrderValue}
              onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Max Cap (₹, optional)
            </label>
            <input
              type="number"
              min={0}
              placeholder="No cap"
              value={newCoupon.maxDiscount}
              onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={savingCoupon}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {savingCoupon ? 'Saving...' : 'Save Coupon'}
            </button>
          </div>
        </form>
      )}

      {/* 3. Controls & Filter Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <SearchIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search coupon by code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 4. Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Percentage</th>
                <th>Minimum Cart Spend</th>
                <th>Maximum Discount Cap</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No coupons found matching search.
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>
                      {c.code}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#16A34A' }}>{c.discountPct}% OFF</span>
                    </td>
                    <td>{formatINR(c.minOrderValue)}</td>
                    <td>{c.maxDiscount ? formatINR(c.maxDiscount) : 'No cap'}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onToggleCoupon(c)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Click to toggle Active/Inactive"
                      >
                        <span className={c.isActive ? styles.badgeSuccess : styles.badgeLow}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onDeleteCoupon(c)}
                        style={{
                          background: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
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
