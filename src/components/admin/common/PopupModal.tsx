'use client';

import React, { useEffect } from 'react';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import styles from './PopupModal.module.css';

export type PopupType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface PopupState {
  open: boolean;
  type: PopupType;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm?: () => void;
}

interface PopupModalProps {
  popup: PopupState;
  onClose: () => void;
}

export default function PopupModal({ popup, onClose }: PopupModalProps) {
  useEffect(() => {
    if (!popup.open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [popup.open, onClose]);

  if (!popup.open) return null;

  function renderIcon() {
    switch (popup.type) {
      case 'success':
        return (
          <div className={`${styles.iconBadge} ${styles.iconSuccess}`}>
            <CheckCircleOutlinedIcon fontSize="small" />
          </div>
        );
      case 'error':
        return (
          <div className={`${styles.iconBadge} ${styles.iconError}`}>
            <ErrorOutlinedIcon fontSize="small" />
          </div>
        );
      case 'warning':
      case 'confirm':
        return (
          <div className={`${styles.iconBadge} ${styles.iconWarning}`}>
            <WarningAmberOutlinedIcon fontSize="small" />
          </div>
        );
      default:
        return (
          <div className={`${styles.iconBadge} ${styles.iconInfo}`}>
            <InfoOutlinedIcon fontSize="small" />
          </div>
        );
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topAccent} />
        <div className={styles.header}>
          <div className={styles.titleRow}>
            {renderIcon()}
            <h3 className={styles.title}>{popup.title}</h3>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{popup.message}</p>
        </div>

        <div className={styles.footer}>
          {popup.type === 'confirm' ? (
            <>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const cb = popup.onConfirm;
                  onClose();
                  if (cb) cb();
                }}
                className={`${styles.confirmBtn} ${popup.danger ? styles.confirmDanger : ''}`}
              >
                {popup.confirmLabel || 'Confirm'}
              </button>
            </>
          ) : (
            <button type="button" onClick={onClose} className={styles.confirmBtn}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
