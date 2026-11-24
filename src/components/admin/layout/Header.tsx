'use client';

import React from 'react';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import StorefrontIcon from '@mui/icons-material/Storefront';

import styles from './Header.module.css';

interface HeaderProps {
  onOpenMobile: () => void;
  pageTitle?: string;
  breadcrumb?: string;
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export default function Header({
  onOpenMobile,
  pageTitle = 'Dashboard Overview',
  breadcrumb = 'REHAS / Admin',
  unreadCount = 0,
  onOpenNotifications,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button
          onClick={onOpenMobile}
          className={styles.menuBtn}
          title="Open Menu"
        >
          <MenuIcon />
        </button>

        <div className={styles.titleArea}>
          <span className={styles.breadcrumb}>{breadcrumb}</span>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Global Search */}
        <div className={styles.searchWrap}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search orders, products..."
            className={styles.searchInput}
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className={styles.actionBtn}
          title="Notifications & Activity"
        >
          <NotificationsNoneIcon fontSize="small" />
          {unreadCount > 0 && <span className={styles.badgeDot} />}
        </button>

        {/* Live Storefront Link */}
        <Link href="/" target="_blank" className={styles.storeLink}>
          <StorefrontIcon fontSize="small" />
          <span>Live Store</span>
        </Link>
      </div>
    </header>
  );
}
