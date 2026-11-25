'use client';

import React, { useState, useEffect } from 'react';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonIcon from '@mui/icons-material/Person';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCsv, exportToExcel } from '@/lib/export-utils';
import styles from './NotificationsSection.module.css';

export interface ActivityNotification {
  id: string;
  title: string;
  description: string;
  type: 'order' | 'security' | 'system' | 'user';
  timestamp: string;
  unread: boolean;
  category?: string;
  email?: string;
}

interface NotificationsSectionProps {
  notifications?: ActivityNotification[];
  onMarkAllRead?: () => void;
}

export default function NotificationsSection({
  notifications: initialNotifications = [],
  onMarkAllRead: initialOnMarkAllRead,
}: NotificationsSectionProps) {
  const [events, setEvents] = useState<ActivityNotification[]>(initialNotifications);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  async function loadAuditLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase()) ||
      (ev.email && ev.email.toLowerCase().includes(search.toLowerCase())) ||
      (ev.category && ev.category.toLowerCase().includes(search.toLowerCase()));

    const category = ev.category || '';
    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'LOGIN' && category === 'Login') ||
      (filterType === 'PASSWORD' && (category.includes('Password') || category.includes('Forgot'))) ||
      (filterType === 'ORDER' && ev.type === 'order') ||
      (filterType === 'USER' && (ev.type === 'user' || category === 'Registration'));

    return matchesSearch && matchesType;
  });

  const totalItems = filteredEvents.length;
  const effectivePageSize = pageSize === 'all' ? (totalItems || 1) : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedEvents = pageSize === 'all'
    ? filteredEvents
    : filteredEvents.slice((validCurrentPage - 1) * effectivePageSize, validCurrentPage * effectivePageSize);

  function getCategoryIcon(category?: string, type?: string) {
    if (category === 'Login') {
      return <LockOpenIcon fontSize="small" style={{ color: '#0284C7' }} />;
    }
    if (category && (category.includes('Password') || category.includes('Forgot'))) {
      return <LockResetIcon fontSize="small" style={{ color: '#D97706' }} />;
    }
    if (type === 'order') {
      return <ShoppingBagIcon fontSize="small" style={{ color: '#16A34A' }} />;
    }
    return <PersonIcon fontSize="small" style={{ color: 'var(--primary)' }} />;
  }

  function handleMarkAllRead() {
    setEvents((prev) => prev.map((ev) => ({ ...ev, unread: false })));
    if (initialOnMarkAllRead) initialOnMarkAllRead();
  }

  function handleExportCsv() {
    exportToCsv(
      ['Category', 'Event Title', 'Patron / Email', 'Description', 'Timestamp'],
      filteredEvents.map((ev) => [
        ev.category || 'General',
        ev.title,
        ev.email || '—',
        ev.description,
        ev.timestamp,
      ]),
      'rehas-activity-audit-log.csv'
    );
  }

  function handleExportExcel() {
    exportToExcel(
      ['Category', 'Event Title', 'Patron / Email', 'Description', 'Timestamp'],
      filteredEvents.map((ev) => [
        ev.category || 'General',
        ev.title,
        ev.email || '—',
        ev.description,
        ev.timestamp,
      ]),
      'rehas-activity-audit-log.xls'
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <span className={styles.vedicTagline}>
            <NotificationsActiveIcon fontSize="inherit" />
            <span>Patron Lifecycle &amp; Security Auditing</span>
          </span>
          <h2 className={styles.mainTitle}>Notifications &amp; Activity Log</h2>
          <p className={styles.mainSubtitle}>
            Live audit of patron logins, password resets, OTP requests, registrations &amp; checkout orders
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={loadAuditLogs}
            disabled={loading}
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
            <span>{loading ? 'Refreshing...' : 'Refresh Activity'}</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
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
            <DoneAllIcon fontSize="small" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <SearchIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by patron email, login or order..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Activities' },
            { id: 'LOGIN', label: 'User Logins' },
            { id: 'PASSWORD', label: 'Password Reset / OTP' },
            { id: 'ORDER', label: 'Patron Orders' },
            { id: 'USER', label: 'Registrations' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFilterType(tab.id);
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: filterType === tab.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: filterType === tab.id ? 'var(--primary)' : '#FAF7FB',
                color: filterType === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top Export Group */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Export:
          </span>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(86, 0, 103, 0.2)',
              background: '#FAF7FB',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            CSV
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(86, 0, 103, 0.2)',
              background: '#FAF7FB',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Excel (XLSX)
          </button>
        </div>
      </div>

      {/* 3. Event List */}
      <div className={styles.card}>
        {paginatedEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No activity events recorded matching criteria.
          </div>
        ) : (
          <div className={styles.list}>
            {paginatedEvents.map((ev) => (
              <div
                key={ev.id}
                className={`${styles.item} ${ev.unread ? styles.itemUnread : ''}`}
              >
                <div className={styles.iconWrap}>{getCategoryIcon(ev.category, ev.type)}</div>
                <div className={styles.content}>
                  <div className={styles.itemTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.itemTitle}>{ev.title}</span>
                      {ev.category && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#FAF5FC',
                            color: 'var(--primary)',
                            border: '1px solid rgba(86, 0, 103, 0.15)',
                          }}
                        >
                          {ev.category}
                        </span>
                      )}
                    </div>
                    <span className={styles.itemTime}>
                      {isNaN(Date.parse(ev.timestamp))
                        ? ev.timestamp
                        : new Date(ev.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                    </span>
                  </div>
                  <p className={styles.itemDesc}>{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Custom Pagination */}
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
