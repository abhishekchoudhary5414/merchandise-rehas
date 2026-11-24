'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import SaveIcon from '@mui/icons-material/Save';
import PopupModal, { PopupState } from '@/components/admin/common/PopupModal';
import styles from '@/components/admin/common/AdminSection.module.css';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    freeShippingThreshold: 999,
    flatRate: 79,
    codEnabled: true,
    codFee: 49,
    gstPercentage: 18,
    serviceablePinCodes: '',
  });

  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<PopupState>({ open: false, type: 'info', title: '', message: '' });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings/shipping');
        const data = await res.json();
        if (data.config) setConfig(data.config);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setPopup({ open: true, type: 'success', title: 'Settings Saved', message: 'Settings updated successfully!' });
      } else {
        setPopup({ open: true, type: 'error', title: 'Save Failed', message: 'Failed to update settings.' });
      }
    } catch (e: any) {
      setPopup({ open: true, type: 'error', title: 'Error', message: e.message || 'An error occurred.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout pageTitle="Store Settings" breadcrumb="REHAS / Settings">
      <div className={styles.card} style={{ maxWidth: '640px' }}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h2 className={styles.title}>Indian Shipping & Tax Settings</h2>
            <span className={styles.subTitle}>Configure delivery fees, free shipping thresholds, GST & COD</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Free Shipping Threshold (INR ₹)
            </label>
            <input
              type="number"
              value={config.freeShippingThreshold}
              onChange={(e) => setConfig({ ...config, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Standard Delivery Fee (INR ₹)
            </label>
            <input
              type="number"
              value={config.flatRate}
              onChange={(e) => setConfig({ ...config, flatRate: parseFloat(e.target.value) || 0 })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              GST Rate (%)
            </label>
            <input
              type="number"
              value={config.gstPercentage}
              onChange={(e) => setConfig({ ...config, gstPercentage: parseFloat(e.target.value) || 0 })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={styles.primaryBtn}
            style={{ marginTop: '0.5rem', justifyContent: 'center' }}
          >
            <SaveIcon fontSize="small" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
      <PopupModal popup={popup} onClose={() => setPopup((p) => ({ ...p, open: false }))} />
    </AdminLayout>
  );
}
