'use client';

import React from 'react';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import styles from './NotificationsSection.module.css';

export interface ActivityNotification {
  id: string;
  title: string;
  description: string;
  type: 'order' | 'security' | 'system';
  timestamp: string;
  unread: boolean;
}

interface NotificationsSectionProps {
  notifications: ActivityNotification[];
  onMarkAllRead: () => void;
}

export default function NotificationsSection({
  notifications,
  onMarkAllRead,
}: NotificationsSectionProps) {
  function getIcon(type: ActivityNotification['type']) {
    switch (type) {
      case 'order':
        return <ShoppingBagOutlinedIcon fontSize="small" />;
      case 'security':
        return <SecurityIcon fontSize="small" />;
      default:
        return <SettingsIcon fontSize="small" />;
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Notifications &amp; Activity Log</h2>
          <span className={styles.subTitle}>
            Real-time capture of admin actions, orders, and security events
          </span>
        </div>

        <button type="button" onClick={onMarkAllRead} className={styles.markReadBtn}>
          <DoneAllIcon fontSize="small" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <NotificationsNoneIcon fontSize="large" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p>No recent notifications or activities recorded.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${n.unread ? styles.itemUnread : ''}`}
            >
              <div className={styles.iconWrap}>{getIcon(n.type)}</div>
              <div className={styles.content}>
                <div className={styles.itemTop}>
                  <span className={styles.itemTitle}>{n.title}</span>
                  <span className={styles.itemTime}>{n.timestamp}</span>
                </div>
                <p className={styles.itemDesc}>{n.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
