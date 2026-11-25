'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Sparkles,
  MapPin,
  RotateCcw,
  Truck,
  Package,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { formatINR } from '@/lib/india-localization';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCSV, exportToXLSX } from '@/lib/export-utils';
import styles from './OrdersSection.module.css';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  state: string;
  pinCode: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
  trackingNumber?: string | null;
  trackingCourier?: string | null;
  createdAt: string;
}

interface OrdersSectionProps {
  onRefreshOrders?: () => void;
  onRefundOrder?: (orderId: string, amount: number) => void;
  onUpdateStatus?: (orderId: string, shippingStatus: string, paymentStatus?: string) => Promise<void>;
  filterMode?: 'all' | 'returns';
}

export default function OrdersSection({
  onRefundOrder,
  onUpdateStatus,
  filterMode = 'all',
}: OrdersSectionProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId: string, newShippingStatus: string) {
    // Optimistic UI update
    setOrders((current) =>
      current.map((o) =>
        o.id === orderId
          ? {
              ...o,
              shippingStatus: newShippingStatus,
              paymentStatus: newShippingStatus === 'CANCELLED' ? 'CANCELLED' : o.paymentStatus,
            }
          : o
      )
    );

    if (onUpdateStatus) {
      await onUpdateStatus(orderId, newShippingStatus);
    } else {
      try {
        await fetch('/api/admin/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, shippingStatus: newShippingStatus }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filterMode === 'returns') {
      const isReturn =
        o.shippingStatus === 'REFUNDED' ||
        o.shippingStatus === 'CANCELLED' ||
        o.paymentStatus === 'REFUNDED';
      if (!isReturn) return false;
    }

    if (selectedStatus !== 'ALL') {
      if (o.shippingStatus !== selectedStatus && o.paymentStatus !== selectedStatus) {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.city.toLowerCase().includes(q)
    );
  });

  function handleExportCSV() {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'City', 'PinCode', 'Total Amount', 'Payment Method', 'Payment Status', 'Shipping Status', 'Tracking Number'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      o.city,
      o.pinCode,
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.shippingStatus,
      o.trackingNumber || 'N/A',
    ]);
    exportToCSV('REHAS_Orders_Report', headers, rows);
  }

  function handleExportXLSX() {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'City', 'PinCode', 'Total Amount', 'Payment Method', 'Payment Status', 'Shipping Status', 'Tracking Number'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      o.city,
      o.pinCode,
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.shippingStatus,
      o.trackingNumber || 'N/A',
    ]);
    exportToXLSX('REHAS_Orders_Report', headers, rows);
  }

  const totalItems = filteredOrders.length;
  const pagedOrders =
    pageSize === 'all'
      ? filteredOrders
      : filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Calculate Overview Metrics
  const totalCount = orders.length;
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
  const paidTotal = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingOrders = orders.filter(
    (o) => o.paymentStatus !== 'PAID' && o.paymentStatus !== 'CANCELLED' && o.paymentStatus !== 'REFUNDED'
  );
  const pendingTotal = pendingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const refundedOrders = orders.filter(
    (o) => o.paymentStatus === 'REFUNDED' || o.shippingStatus === 'REFUNDED'
  );
  const refundedTotal = refundedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const cancelledOrders = orders.filter(
    (o) => o.paymentStatus === 'CANCELLED' || o.shippingStatus === 'CANCELLED'
  );
  const cancelledTotal = cancelledOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className={styles.container}>
      {/* Banner Header with Vedic Theme */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <div className={styles.vedicTagline}>
            <Sparkles size={13} color="#D8B878" />
            <span>Sacred Order Fulfillment</span>
          </div>
          <h2 className={styles.mainTitle}>
            {filterMode === 'returns' ? 'Returns & Refunds Management' : 'Customer Orders & Dispatches'}
          </h2>
          <p className={styles.mainSubtitle}>
            Live order logs, courier transit tracking & payment fulfillment records from Neon DB
          </p>
        </div>

        <div className={styles.controlsArea}>
          {/* Top Export Buttons */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FAF7FB', padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(86, 0, 103, 0.1)' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Export:</span>
            <button
              type="button"
              onClick={handleExportCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#FFFFFF', border: '1px solid rgba(86, 0, 103, 0.18)', borderRadius: '7px', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
              title="Download Orders CSV"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportXLSX}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '7px', fontSize: '12px', fontWeight: 700, color: '#047857', cursor: 'pointer' }}
              title="Download Orders Excel (XLSX)"
            >
              <FileSpreadsheet size={13} />
              <span>Excel (XLSX)</span>
            </button>
          </div>

          <div className={styles.searchWrap}>
            <Search size={16} color="var(--primary)" />
            <input
              type="text"
              placeholder="Search by order #, patron, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.statusFilterSelect}
          >
            <option value="ALL">All Statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={loadOrders}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Orders'}</span>
          </button>
        </div>
      </div>

      {/* Quick Metric Pills Row (Matches Customers Section) */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FAF5FC', color: 'var(--primary)' }}>
            <ShoppingBag size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Total Orders</span>
            <span className={styles.summaryPillValue}>{loading ? '...' : totalCount}</span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Paid Volume</span>
            <span className={styles.summaryPillValue} style={{ color: '#059669' }}>
              ₹{loading ? '...' : Math.round(paidTotal).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <Clock size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Pending Volume</span>
            <span className={styles.summaryPillValue} style={{ color: '#D97706' }}>
              ₹{loading ? '...' : Math.round(pendingTotal).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FFF1F2', color: '#E11D48' }}>
            <RotateCcw size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Total Refunded</span>
            <span className={styles.summaryPillValue} style={{ color: '#E11D48' }}>
              ₹{loading ? '...' : Math.round(refundedTotal).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FEF2F2', color: '#DC2626' }}>
            <XCircle size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Cancelled Volume</span>
            <span className={styles.summaryPillValue} style={{ color: '#DC2626' }}>
              ₹{loading ? '...' : Math.round(cancelledTotal).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.directoryTable}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Patron Details</th>
                <th>Destination</th>
                <th>Amount</th>
                <th>Payment State</th>
                <th>Fulfillment Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Shimmer Skeleton Loader (Exact Match to Customer section)
                [1, 2, 3].map((n) => (
                  <tr key={`skel-order-${n}`} className={styles.tableRow}>
                    <td>
                      <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '130px' }} />
                    </td>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={`${styles.skelAvatar} ${styles.skeletonShimmer}`} />
                        <div>
                          <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '120px', height: '14px', marginBottom: '4px' }} />
                          <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '85px', height: '11px' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '100px', height: '15px' }} />
                    </td>
                    <td>
                      <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '70px', height: '18px' }} />
                    </td>
                    <td>
                      <div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '90px' }} />
                    </td>
                    <td>
                      <div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '130px' }} />
                    </td>
                    <td>
                      <div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '65px' }} />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyTitle}>No Orders Found</div>
                      <p>No customer orders matched your current search and filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedOrders.map((o) => {
                  const initials = o.customerName
                    ? o.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'RP';

                  const isPaid = o.paymentStatus === 'PAID';
                  const isCancelled = o.paymentStatus === 'CANCELLED' || o.shippingStatus === 'CANCELLED';

                  return (
                    <tr key={o.id} className={styles.tableRow}>
                      {/* Order # & Timestamp */}
                      <td>
                        <div className={styles.orderNumberCell}>
                          <span className={styles.orderNumber}>{o.orderNumber}</span>
                          <span className={styles.orderDate}>
                            {new Date(o.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td>
                        <div className={styles.customerCell}>
                          <div className={styles.customerAvatar}>{initials}</div>
                          <div className={styles.customerInfo}>
                            <span className={styles.customerName}>{o.customerName}</span>
                            <span className={styles.customerPhone}>{o.customerPhone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td>
                        <div className={styles.locationCell}>
                          <span className={styles.cityText}>{o.city}</span>
                          <span className={styles.pinText}>PIN: {o.pinCode}</span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td>
                        <span className={styles.amountCell}>{formatINR(o.totalAmount)}</span>
                      </td>

                      {/* Payment Badge */}
                      <td>
                        <span
                          className={`${styles.paymentBadge} ${
                            isPaid
                              ? styles.paymentPaid
                              : isCancelled
                              ? styles.paymentCancelled
                              : styles.paymentPending
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={12} /> : isCancelled ? <XCircle size={12} /> : <Clock size={12} />}
                          <span>{o.paymentMethod} · {o.paymentStatus}</span>
                        </span>
                      </td>

                      {/* Fulfillment Stage Dropdown */}
                      <td>
                        <select
                          value={o.shippingStatus}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={styles.fulfillmentSelect}
                          style={{
                            color:
                              o.shippingStatus === 'DELIVERED'
                                ? '#059669'
                                : o.shippingStatus === 'CANCELLED'
                                ? '#DC2626'
                                : o.shippingStatus === 'DISPATCHED' || o.shippingStatus === 'SHIPPED'
                                ? '#2563EB'
                                : 'var(--text-primary)',
                          }}
                        >
                          <option value="PROCESSING">Processing</option>
                          <option value="PACKED">Packed</option>
                          <option value="DISPATCHED">Dispatched</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td>
                        {isPaid && onRefundOrder ? (
                          <button
                            type="button"
                            onClick={() => onRefundOrder(o.id, o.totalAmount)}
                            className={styles.refundBtn}
                          >
                            <RotateCcw size={12} />
                            <span>Refund</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>—</span>
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
