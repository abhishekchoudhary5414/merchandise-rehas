'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Sparkles,
  ShieldCheck,
  MapPin,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCSV, exportToXLSX } from '@/lib/export-utils';
import styles from './CustomersSection.module.css';

interface CustomerOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  shippingStatus: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  type: 'Registered Patron' | 'Guest Shopper';
  joinedAt: string;
  city: string;
  state: string;
  defaultAddress: string;
  totalOrders: number;
  totalSpent: number;
  paidAmount: number;
  pendingAmount: number;
  cancelledAmount: number;
  paidCount: number;
  pendingCount: number;
  cancelledCount: number;
  orders: CustomerOrder[];
}

export interface CustomerOverview {
  totalCustomers: number;
  registeredCount: number;
  guestCount: number;
  totalOrders: number;
  totalLifetimeSpend: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  totalCancelledAmount: number;
}

interface CustomersSectionProps {
  initialCustomers?: Customer[];
  initialOverview?: CustomerOverview | null;
}

export default function CustomersSection({ initialCustomers = [], initialOverview = null }: CustomersSectionProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [overview, setOverview] = useState<CustomerOverview | null>(initialOverview);
  const [loading, setLoading] = useState(initialCustomers.length === 0);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        if (data.customers) setCustomers(data.customers);
        if (data.overview) setOverview(data.overview);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q)
    );
  });

  function handleExportCSV() {
    const headers = ['Customer Name', 'Email', 'Phone', 'Type', 'City', 'Total Orders', 'Paid Amount', 'Pending Amount', 'Cancelled Amount', 'Joined Date'];
    const rows = filteredCustomers.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.type,
      c.city,
      c.totalOrders,
      c.paidAmount,
      c.pendingAmount,
      c.cancelledAmount,
      new Date(c.joinedAt).toLocaleDateString('en-IN'),
    ]);
    exportToCSV('REHAS_Customers_Directory', headers, rows);
  }

  function handleExportXLSX() {
    const headers = ['Customer Name', 'Email', 'Phone', 'Type', 'City', 'Total Orders', 'Paid Amount', 'Pending Amount', 'Cancelled Amount', 'Joined Date'];
    const rows = filteredCustomers.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.type,
      c.city,
      c.totalOrders,
      c.paidAmount,
      c.pendingAmount,
      c.cancelledAmount,
      new Date(c.joinedAt).toLocaleDateString('en-IN'),
    ]);
    exportToXLSX('REHAS_Customers_Directory', headers, rows);
  }

  const totalItems = filteredCustomers.length;
  const pagedCustomers =
    pageSize === 'all'
      ? filteredCustomers
      : filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className={styles.container}>
      {/* Banner Header with Vedic Theme */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <div className={styles.vedicTagline}>
            <Sparkles size={13} color="#D8B878" />
            <span>Vedic Boutique Patrons</span>
          </div>
          <h2 className={styles.mainTitle}>Registered Patrons & Customers</h2>
          <p className={styles.mainSubtitle}>
            Live customer records, contact information & order payment breakdowns from Neon DB
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
              title="Download Customers CSV"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportXLSX}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '7px', fontSize: '12px', fontWeight: 700, color: '#047857', cursor: 'pointer' }}
              title="Download Customers Excel (XLSX)"
            >
              <FileSpreadsheet size={13} />
              <span>Excel (XLSX)</span>
            </button>
          </div>

          <div className={styles.searchWrap}>
            <Search size={16} color="var(--primary)" />
            <input
              type="text"
              placeholder="Search by patron name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={fetchCustomers}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Patrons'}</span>
          </button>
        </div>
      </div>

      {/* Quick Metric Pills Row */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FAF5FC', color: 'var(--primary)' }}>
            <Users size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Total Patrons</span>
            <span className={styles.summaryPillValue}>
              {loading ? '...' : (overview?.totalCustomers ?? customers.length)}
            </span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <ShoppingBag size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Total Orders</span>
            <span className={styles.summaryPillValue} style={{ color: '#2563EB' }}>
              {loading ? '...' : (overview?.totalOrders ?? 0)}
            </span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Total Paid</span>
            <span className={styles.summaryPillValue} style={{ color: '#059669' }}>
              ₹{loading ? '...' : Math.round(overview?.totalPaidAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <Clock size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Total Pending</span>
            <span className={styles.summaryPillValue} style={{ color: '#D97706' }}>
              ₹{loading ? '...' : Math.round(overview?.totalPendingAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className={styles.summaryPillCard}>
          <div className={styles.summaryPillIcon} style={{ background: '#FEF2F2', color: '#DC2626' }}>
            <XCircle size={20} />
          </div>
          <div className={styles.summaryPillContent}>
            <span className={styles.summaryPillLabel}>Total Cancelled</span>
            <span className={styles.summaryPillValue} style={{ color: '#DC2626' }}>
              ₹{loading ? '...' : Math.round(overview?.totalCancelledAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Directory Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.directoryTable}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Info</th>
                <th>Total Orders</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Canceled</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Custom Shimmer Skeleton Rows
                [1, 2, 3].map((n) => (
                  <tr key={`skel-row-${n}`} className={styles.tableRow}>
                    <td>
                      <div className={styles.customerProfileCell}>
                        <div className={`${styles.skelAvatar} ${styles.skeletonShimmer}`} />
                        <div>
                          <div className={`${styles.skelTextLg} ${styles.skeletonShimmer}`} />
                          <div className={`${styles.skelTextSm} ${styles.skeletonShimmer}`} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className={`${styles.skelTextLg} ${styles.skeletonShimmer}`} style={{ width: '150px' }} />
                        <div className={`${styles.skelTextSm} ${styles.skeletonShimmer}`} style={{ width: '90px' }} />
                      </div>
                    </td>
                    <td>
                      <div className={`${styles.skelPill} ${styles.skeletonShimmer}`} />
                    </td>
                    <td>
                      <div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '70px' }} />
                    </td>
                    <td>
                      <div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '70px' }} />
                    </td>
                    <td>
                      <div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '70px' }} />
                    </td>
                  </tr>
                ))
              ) : pagedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyTitle}>No Patrons Found</div>
                      <p>No customer profile matches your current search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedCustomers.map((cust) => {
                  const initials = cust.name
                    ? cust.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'RP';

                  return (
                    <tr key={cust.id} className={styles.tableRow}>
                      {/* 1. Customer Name */}
                      <td>
                        <div className={styles.customerProfileCell}>
                          <div className={styles.avatarBadge}>{initials}</div>
                          <div className={styles.customerMeta}>
                            <span className={styles.customerFullName}>{cust.name}</span>
                            <span className={styles.customerJoinTag}>
                              Joined {new Date(cust.joinedAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className={styles.patronTypeTag}>
                              <ShieldCheck size={11} />
                              {cust.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact Info */}
                      <td>
                        <div className={styles.contactBlock}>
                          <span className={styles.emailItem}>
                            <Mail size={13} color="var(--primary)" />
                            <span>{cust.email}</span>
                          </span>
                          <span className={styles.phoneItem}>
                            <Phone size={13} color="var(--text-tertiary)" />
                            <span>{cust.phone}</span>
                          </span>
                          {cust.city && cust.city !== 'Location Pending' && (
                            <span className={styles.phoneItem} style={{ color: 'var(--text-secondary)' }}>
                              <MapPin size={13} color="var(--secondary)" />
                              <span>{cust.city}{cust.state ? `, ${cust.state}` : ''}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Total Orders */}
                      <td>
                        <div className={styles.ordersCountPill}>
                          <ShoppingBag size={14} />
                          <span>
                            {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Paid */}
                      <td>
                        {cust.paidAmount > 0 ? (
                          <span className={`${styles.amountBadge} ${styles.amountPaid}`}>
                            <CheckCircle2 size={13} />
                            <span>₹{Math.round(cust.paidAmount).toLocaleString('en-IN')}</span>
                          </span>
                        ) : (
                          <span className={styles.amountZero}>₹0</span>
                        )}
                      </td>

                      {/* 5. Pending */}
                      <td>
                        {cust.pendingAmount > 0 ? (
                          <span className={`${styles.amountBadge} ${styles.amountPending}`}>
                            <Clock size={13} />
                            <span>₹{Math.round(cust.pendingAmount).toLocaleString('en-IN')}</span>
                          </span>
                        ) : (
                          <span className={styles.amountZero}>₹0</span>
                        )}
                      </td>

                      {/* 6. Canceled */}
                      <td>
                        {cust.cancelledAmount > 0 ? (
                          <span className={`${styles.amountBadge} ${styles.amountCancelled}`}>
                            <XCircle size={13} />
                            <span>₹{Math.round(cust.cancelledAmount).toLocaleString('en-IN')}</span>
                          </span>
                        ) : (
                          <span className={styles.amountZero}>₹0</span>
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
