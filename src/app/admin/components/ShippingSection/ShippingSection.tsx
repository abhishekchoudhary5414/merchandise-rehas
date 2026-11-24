'use client';

import React, { useState } from 'react';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PopupModal, { PopupState } from '@/components/admin/common/PopupModal';
import styles from './ShippingSection.module.css';

export interface ShippingConfig {
  id: number;
  freeShippingThreshold: number;
  flatRate: number;
  codEnabled: boolean;
  codFee: number;
  gstPercentage: number;
  serviceablePinCodes: string | null;
}

interface ShippingSectionProps {
  config: ShippingConfig;
  setConfig: React.Dispatch<React.SetStateAction<ShippingConfig>>;
  onSaveSuccess?: () => void;
}

export default function ShippingSection({ config, setConfig, onSaveSuccess }: ShippingSectionProps) {
  const [savingConfig, setSavingConfig] = useState(false);
  const [popup, setPopup] = useState<PopupState>({ open: false, type: 'info', title: '', message: '' });

  async function saveShippingConfig() {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/admin/settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setPopup({ open: true, type: 'success', title: 'Configuration Saved', message: 'Shipping and payment configuration updated successfully!' });
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setPopup({ open: true, type: 'error', title: 'Save Failed', message: 'Failed to save configuration' });
      }
    } catch (e) {
      console.error(e);
      setPopup({ open: true, type: 'error', title: 'Error', message: 'An error occurred while saving.' });
    } finally {
      setSavingConfig(false);
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <LocalShippingOutlinedIcon fontSize="medium" /> Indian Shipping & COD Policies
      </h2>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Free Shipping Minimum Cart Value (INR ₹)
          </label>
          <span className={styles.subLabel}>
            Orders at or above this amount automatically receive free delivery across India.
          </span>
          <input
            type="number"
            value={config.freeShippingThreshold}
            onChange={(e) =>
              setConfig({ ...config, freeShippingThreshold: parseFloat(e.target.value) || 0 })
            }
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Standard Flat-Rate Shipping (INR ₹)
          </label>
          <span className={styles.subLabel}>
            Applied when total order value is below the free shipping threshold.
          </span>
          <input
            type="number"
            value={config.flatRate}
            onChange={(e) =>
              setConfig({ ...config, flatRate: parseFloat(e.target.value) || 0 })
            }
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Applicable GST Rate (%)
          </label>
          <span className={styles.subLabel}>
            Indian GST percentage applied on products during checkout.
          </span>
          <input
            type="number"
            value={config.gstPercentage}
            onChange={(e) =>
              setConfig({ ...config, gstPercentage: parseFloat(e.target.value) || 0 })
            }
            className={styles.input}
          />
        </div>

        <div className={styles.checkboxContainer}>
          <div>
            <div className={styles.label}>Enable Cash on Delivery (COD)</div>
            <div className={styles.subLabel}>Allow customers across India to pay via COD.</div>
          </div>
          <input
            type="checkbox"
            checked={config.codEnabled}
            onChange={(e) => setConfig({ ...config, codEnabled: e.target.checked })}
            className={styles.checkbox}
          />
        </div>

        {config.codEnabled && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              COD Handling Fee (INR ₹)
            </label>
            <span className={styles.subLabel}>
              Extra handling charge applied for Cash on Delivery orders.
            </span>
            <input
              type="number"
              value={config.codFee}
              onChange={(e) =>
                setConfig({ ...config, codFee: parseFloat(e.target.value) || 0 })
              }
              className={styles.input}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Serviceable PIN Codes (Optional Whitelist)
          </label>
          <span className={styles.subLabel}>
            Leave blank to enable all 19,000+ Indian Postal Pincodes.
          </span>
          <input
            type="text"
            placeholder="e.g. 110001, 400001, 560001"
            value={config.serviceablePinCodes || ''}
            onChange={(e) => setConfig({ ...config, serviceablePinCodes: e.target.value })}
            className={styles.input}
          />
        </div>

        <button
          onClick={saveShippingConfig}
          disabled={savingConfig}
          className={styles.saveButton}
        >
          <SaveOutlinedIcon fontSize="small" />
          {savingConfig ? 'Saving Changes...' : 'Save Shipping Settings'}
        </button>
      </div>
      <PopupModal popup={popup} onClose={() => setPopup((p) => ({ ...p, open: false }))} />
    </div>
  );
}
