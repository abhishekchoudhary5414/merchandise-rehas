'use client';

import React, { useState } from 'react';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCsv, exportToExcel } from '@/lib/export-utils';
import { formatINR } from '@/lib/india-localization';
import styles from './CouponsSection.module.css';

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

  // Dynamic Metrics
  const activeCouponsCount = coupons.filter((c) => c.isActive).length;
  const inactiveCouponsCount = coupons.filter((c) => !c.isActive).length;
  const maxDiscountInCatalog = coupons.length > 0 ? Math.max(...coupons.map((c) => Number(c.discountPct) || 0)) : 0;

  function handleExportCsv() {
    exportToCsv(
      ['Coupon Code', 'Discount (%)', 'Min Order (INR)', 'Max Discount (INR)', 'Status'],
      filtered.map((c) => [
        c.code,
        `${c.discountPct}%`,
        c.minOrderValue,
        c.maxDiscount || 'No Cap',
        c.isActive ? 'Active' : 'Inactive',
      ]),
      'rehas-coupons.csv'
    );
  }

  function handleExportExcel() {
    exportToExcel(
      ['Coupon Code', 'Discount (%)', 'Min Order (INR)', 'Max Discount (INR)', 'Status'],
      filtered.map((c) => [
        c.code,
        `${c.discountPct}%`,
        c.minOrderValue,
        c.maxDiscount || 'No Cap',
        c.isActive ? 'Active' : 'Inactive',
      ]),
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
            <CheckCircleOutlineOutlinedIcon fontSize="small" style={{ color: '#16A34A' }} />
            <span>Active Coupons:</span>
            <strong>{activeCouponsCount} Active</strong>
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
            className={styles.syncBtn}
            title="Refresh coupons from database"
          >
            <RefreshIcon fontSize="small" />
            <span>{loadingCoupons ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCouponForm((v) => !v)}
            className={styles.primaryBtn}
          >
            <AddCircleOutlineOutlinedIcon fontSize="small" />
            <span>{showCouponForm ? 'Close Form' : 'Create Coupon'}</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className={styles.cardsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FAF5FC', color: 'var(--primary)' }}>
            <LocalOfferOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Created Vouchers</span>
            <span className={styles.statValue}>{coupons.length} Coupons</span>
            <span className={styles.statSub}>Neon PostgreSQL Database</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <CheckCircleOutlineOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active At Checkout</span>
            <span className={styles.statValue} style={{ color: '#16A34A' }}>{activeCouponsCount} Active</span>
            <span className={styles.statSub}>Redeemable by store patrons</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <PercentOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Maximum Store Discount</span>
            <span className={styles.statValue} style={{ color: '#D97706' }}>{maxDiscountInCatalog}% OFF</span>
            <span className={styles.statSub}>Highest promotional benefit</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FAF7FB', color: 'var(--secondary)' }}>
            <ShoppingBagOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Inactive / Paused</span>
            <span className={styles.statValue}>{inactiveCouponsCount} Vouchers</span>
            <span className={styles.statSub}>Temporarily disabled</span>
          </div>
        </div>
      </div>

      {/* 3. Create Coupon Form */}
      {showCouponForm && (
        <form onSubmit={onCreateCoupon} className={styles.formCard}>
          <div className={styles.formHeader}>
            <ConfirmationNumberIcon fontSize="small" />
            <span>Create Consecrated Store Voucher</span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. SHIVA15"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className={`${styles.input} ${styles.codeInput}`}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Discount Percentage (%) *</label>
              <input
                type="number"
                required
                min={1}
                max={90}
                value={newCoupon.discountPct}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountPct: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Minimum Order Value (₹)</label>
              <input
                type="number"
                min={0}
                value={newCoupon.minOrderValue}
                onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Maximum Discount Cap (₹, optional)</label>
              <input
                type="number"
                min={0}
                placeholder="No cap"
                value={newCoupon.maxDiscount}
                onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                className={styles.input}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowCouponForm(false)}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'transparent',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCoupon}
              className={styles.primaryBtn}
            >
              <span>{savingCoupon ? 'Saving Voucher...' : 'Save & Activate Coupon'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Controls & Filter Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <SearchIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search coupon by code (e.g. WELCOME10)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 5. Coupons Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Percentage</th>
                <th>Minimum Cart Spend</th>
                <th>Maximum Discount Cap</th>
                <th>Redemption Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-secondary)' }}>
                    No coupons found in database matching search. Click &ldquo;Create Coupon&rdquo; to add one.
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className={styles.codeCell}>{c.code}</span>
                    </td>
                    <td>
                      <span className={styles.discountPill}>
                        <PercentOutlinedIcon fontSize="inherit" />
                        <span>{c.discountPct}% OFF</span>
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{formatINR(c.minOrderValue)}</strong>
                    </td>
                    <td>
                      <span>{c.maxDiscount ? formatINR(c.maxDiscount) : 'No cap'}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onToggleCoupon(c)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Click to toggle Active / Inactive status"
                      >
                        <span className={c.isActive ? styles.badgeActive : styles.badgeInactive}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.isActive ? '#16A34A' : '#94A3B8' }} />
                          <span>{c.isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onDeleteCoupon(c)}
                        className={styles.deleteBtn}
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

      {/* 6. Custom Pagination */}
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
