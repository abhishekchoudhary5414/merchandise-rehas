'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar, { DashboardSection } from './Sidebar';
import Header from './Header';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumb?: string;
  activeSection?: DashboardSection;
  onSelectSection?: (section: DashboardSection) => void;
  unreadCount?: number;
}

export default function AdminLayout({
  children,
  pageTitle = 'Dashboard Overview',
  breadcrumb = 'REHAS / Merchandise',
  activeSection = 'overview',
  onSelectSection = () => {},
  unreadCount = 0,
}: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Automatic logout watchdog: checks if current browser session was revoked remotely
  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const res = await fetch('/api/admin/sessions', { cache: 'no-store' });
        if (res.status === 401 && active) {
          router.push('/admin/login');
          router.refresh();
        }
      } catch {
        // Ignore transient network errors
      }
    }

    verifySession();
    const interval = setInterval(verifySession, 10000);
    const handleFocus = () => verifySession();
    window.addEventListener('focus', handleFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);

  return (
    <div className={styles.wrapper}>
      {/* Collapsible Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        activeSection={activeSection}
        onSelectSection={onSelectSection}
      />

      {/* Main Content Area */}
      <div
        className={`${styles.mainArea} ${
          sidebarCollapsed ? styles.mainAreaCollapsed : ''
        }`}
      >
        <Header
          onOpenMobile={() => setMobileOpen(true)}
          pageTitle={pageTitle}
          breadcrumb={breadcrumb}
          unreadCount={unreadCount}
          onOpenNotifications={() => onSelectSection('notifications')}
        />

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
