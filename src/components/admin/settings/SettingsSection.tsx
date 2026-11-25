'use client';

import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import styles from './SettingsSection.module.css';

interface SettingsSectionProps {
  shippingConfig: {
    freeShippingThreshold: number;
    flatRate: number;
    codEnabled: boolean;
    codFee: number;
    gstPercentage: number;
    serviceablePinCodes: string;
  };
  setShippingConfig: React.Dispatch<React.SetStateAction<any>>;
  savingSettings: boolean;
  onSave: () => void;
}

export default function SettingsSection({
  shippingConfig,
  setShippingConfig,
  savingSettings,
  onSave,
}: SettingsSectionProps) {
  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <span className={styles.vedicTagline}>
            <SettingsIcon fontSize="inherit" />
            <span>Store Logistics &amp; Fiscal Policy</span>
          </span>
          <h2 className={styles.mainTitle}>Indian Shipping &amp; Tax Settings</h2>
          <p className={styles.mainSubtitle}>
            Configure nationwide delivery charges, free freight thresholds, GST calculation &amp; Cash on Delivery policies
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={savingSettings}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #3D0049 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(86, 0, 103, 0.2)',
          }}
        >
          <SaveOutlinedIcon fontSize="small" />
          <span>{savingSettings ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* 2. Grid Cards */}
      <div className={styles.settingsGrid}>
        {/* Shipping & Delivery card */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrap}>
              <LocalShippingOutlinedIcon />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Shipping &amp; Delivery Logistics</h3>
              <span className={styles.cardSubtitle}>PAN-India courier rules and delivery tariffs</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Free Delivery Minimum Cart Spend (INR ₹)</label>
            <input
              type="number"
              min={0}
              value={shippingConfig.freeShippingThreshold}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  freeShippingThreshold: parseFloat(e.target.value) || 0,
                })
              }
              className={styles.input}
            />
            <span className={styles.hint}>Orders at or above this amount automatically receive complimentary shipping.</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Standard Flat Shipping Charge (INR ₹)</label>
            <input
              type="number"
              min={0}
              value={shippingConfig.flatRate}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  flatRate: parseFloat(e.target.value) || 0,
                })
              }
              className={styles.input}
            />
            <span className={styles.hint}>Applied to orders below the free shipping threshold across all Indian states.</span>
          </div>
        </div>

        {/* GST & Taxation Card */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrap}>
              <ReceiptLongOutlinedIcon />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Indian Goods &amp; Services Tax (GST)</h3>
              <span className={styles.cardSubtitle}>Statutory compliance for consecrated spiritual merchandise</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Standard GST Rate (%)</label>
            <input
              type="number"
              min={0}
              max={28}
              value={shippingConfig.gstPercentage}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  gstPercentage: parseFloat(e.target.value) || 0,
                })
              }
              className={styles.input}
            />
            <span className={styles.hint}>Product prices include 18% standard GST for luxury spiritual stones and silver accents.</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Invoice Billing Currency</label>
            <input
              type="text"
              readOnly
              value="INR (₹) - Indian Rupee"
              className={styles.input}
              style={{ background: '#F8FAFC', color: '#64748B' }}
            />
          </div>
        </div>

        {/* Cash On Delivery (COD) Card */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrap}>
              <PaymentsOutlinedIcon />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Cash On Delivery (COD) Policy</h3>
              <span className={styles.cardSubtitle}>Doorstep cash collection surcharge and handling</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#FAF7FB', borderRadius: '10px' }}>
            <div>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '13.5px', color: 'var(--primary)' }}>Enable Cash on Delivery</span>
              <span style={{ fontSize: '11.5px', color: '#64748B' }}>Allow patrons to pay upon package receipt</span>
            </div>
            <input
              type="checkbox"
              checked={shippingConfig.codEnabled}
              onChange={(e) => setShippingConfig({ ...shippingConfig, codEnabled: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>COD Handling Surcharge (INR ₹)</label>
            <input
              type="number"
              min={0}
              value={shippingConfig.codFee}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  codFee: parseFloat(e.target.value) || 0,
                })
              }
              className={styles.input}
            />
            <span className={styles.hint}>Additional verification &amp; courier remittance fee for COD shipments.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
