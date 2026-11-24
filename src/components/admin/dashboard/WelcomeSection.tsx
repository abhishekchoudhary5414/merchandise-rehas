'use client';

import React, { useState, useEffect } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

import styles from './WelcomeSection.module.css';

interface WelcomeSectionProps {
  onAddProduct?: () => void;
}

export default function WelcomeSection({ onAddProduct }: WelcomeSectionProps) {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

  return (
    <div className={styles.welcomeCard}>
      <div className={styles.titleArea}>
        <h2 className={styles.heading}>Welcome back, Admin!</h2>
        <p className={styles.subheading}>
          Here is what is happening with your REHAS sacred merchandise store today.
        </p>
      </div>

      <div className={styles.actionsArea}>
        <div className={styles.dateBadge}>
          <CalendarMonthIcon fontSize="small" />
          <span>{currentDate || 'Today'}</span>
        </div>

        <button
          type="button"
          onClick={onAddProduct}
          className={styles.addProductBtn}
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <AddCircleOutlineOutlinedIcon fontSize="small" />
          <span>Add Product</span>
        </button>
      </div>
    </div>
  );
}
