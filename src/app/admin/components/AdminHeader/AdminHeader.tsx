'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LogoutIcon from '@mui/icons-material/Logout';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
      router.push('/admin/login');
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <div className={styles.brandBadge}>
            <div className={styles.brandIcon}>
              <SecurityIcon fontSize="small" />
            </div>
            <h1 className={styles.brandTitle}>
              REHAS <span className={styles.adminTag}>Admin Portal</span>
            </h1>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Link href="/" className={styles.storeLink}>
            <ArrowBackIcon fontSize="small" /> Storefront
          </Link>

          <Link href="/admin/seo" className={styles.seoLink}>
            <Inventory2OutlinedIcon fontSize="small" /> SEO & Drive Studio <OpenInNewIcon fontSize="inherit" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={styles.logoutBtn}
            title="Sign Out"
          >
            <LogoutIcon fontSize="small" />
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </header>
  );
}
