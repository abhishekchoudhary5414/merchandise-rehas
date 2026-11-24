import React from 'react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import styles from './HeaderStickyGroup.module.css';

interface HeaderStickyGroupProps {
  cartCount?: number;
}

export default function HeaderStickyGroup({ cartCount = 0 }: HeaderStickyGroupProps) {
  return (
    <div className={styles.stickyHeaderGroup}>
      <AnnouncementBar />
      <Navbar cartCount={cartCount} />
    </div>
  );
}
