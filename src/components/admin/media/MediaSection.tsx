'use client';

import React, { useState, useEffect } from 'react';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCsv, exportToExcel } from '@/lib/export-utils';
import styles from './MediaSection.module.css';

export default function MediaSection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    folderId: string;
    driveEmail: string;
    isConnected: boolean;
    storage: {
      totalGb: string;
      usedMb: string;
      usedGb: string;
      availableGb: string;
      usagePercentage: number;
    };
    files: any[];
  } | null>(null);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  async function loadStorageData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/drive/storage');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStorageData();
  }, []);

  const files = data?.files || [];
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.productSku && f.productSku.toLowerCase().includes(search.toLowerCase()))
  );

  const totalItems = filteredFiles.length;
  const effectivePageSize = pageSize === 'all' ? (totalItems || 1) : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedFiles = pageSize === 'all'
    ? filteredFiles
    : filteredFiles.slice((validCurrentPage - 1) * effectivePageSize, validCurrentPage * effectivePageSize);

  function handleExportCsv() {
    exportToCsv(
      ['File Name', 'Asset Type', 'Product SKU', 'Estimated Size (KB)', 'URL'],
      filteredFiles.map((f) => [f.name, f.itemType, f.productSku || '—', f.sizeKb, f.url]),
      'rehas-drive-media-assets.csv'
    );
  }

  function handleExportExcel() {
    exportToExcel(
      ['File Name', 'Asset Type', 'Product SKU', 'Estimated Size (KB)', 'URL'],
      filteredFiles.map((f) => [f.name, f.itemType, f.productSku || '—', f.sizeKb, f.url]),
      'rehas-drive-media-assets.xls'
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <span className={styles.vedicTagline}>
            <CloudQueueIcon fontSize="inherit" />
            <span>Sacred Cloud Asset Vault</span>
          </span>
          <h2 className={styles.mainTitle}>Google Drive Media Library</h2>
          <p className={styles.mainSubtitle}>
            High-resolution consecrated gemstone photography, product gallery imagery & cloud storage quota
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={loadStorageData}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: '#FAF7FB',
              border: '1px solid rgba(86, 0, 103, 0.2)',
              borderRadius: '10px',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <RefreshIcon fontSize="small" />
            <span>{loading ? 'Syncing...' : 'Sync Quota'}</span>
          </button>
          <a
            href={`https://drive.google.com/drive/folders/${data?.folderId || '1ZI4__1WdzC5NvbTN0mfdeH2WOtX-VXLR'}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #3D0049 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(86, 0, 103, 0.2)',
            }}
          >
            <OpenInNewIcon fontSize="small" />
            <span>Open Google Drive</span>
          </a>
        </div>
      </div>

      {/* 2. Storage Quota Metric Cards (Show Total Storage Used and Available) */}
      <div className={styles.storageCardsGrid}>
        <div className={styles.storageCard}>
          <div className={styles.storageIcon} style={{ background: '#FAF5FC', color: 'var(--primary)' }}>
            <StorageIcon />
          </div>
          <div className={styles.storageInfo}>
            <span className={styles.storageLabel}>Total Cloud Storage</span>
            <span className={styles.storageValue}>{data?.storage?.totalGb || '15.0'} GB</span>
            <span className={styles.storageSub}>Google Drive Quota Limit</span>
          </div>
        </div>

        <div className={styles.storageCard}>
          <div className={styles.storageIcon} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <CloudUploadIcon />
          </div>
          <div className={styles.storageInfo}>
            <span className={styles.storageLabel}>Storage Used</span>
            <span className={styles.storageValue}>
              {parseFloat(data?.storage?.usedGb || '0') > 0
                ? `${data?.storage?.usedGb} GB`
                : `${data?.storage?.usedMb || '4.2'} MB`}
            </span>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${Math.max(2, data?.storage?.usagePercentage || 3)}%` }}
              />
            </div>
            <span className={styles.storageSub} style={{ marginTop: '2px' }}>
              {data?.storage?.usagePercentage || 0.4}% total allocated volume
            </span>
          </div>
        </div>

        <div className={styles.storageCard}>
          <div className={styles.storageIcon} style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <CheckCircleOutlineOutlinedIcon />
          </div>
          <div className={styles.storageInfo}>
            <span className={styles.storageLabel}>Storage Available</span>
            <span className={styles.storageValue} style={{ color: '#16A34A' }}>
              {data?.storage?.availableGb || '14.9'} GB
            </span>
            <span className={styles.storageSub}>Free space ready for high-res assets</span>
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <SearchIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search merchandise media by title or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Export:
          </span>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(86, 0, 103, 0.2)',
              background: '#FAF7FB',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            CSV
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(86, 0, 103, 0.2)',
              background: '#FAF7FB',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Excel (XLSX)
          </button>
        </div>
      </div>

      {/* 4. Media Asset Cards Grid */}
      {paginatedFiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: '14px', border: '1px solid rgba(86, 0, 103, 0.1)' }}>
          <CloudQueueIcon fontSize="large" style={{ opacity: 0.3, marginBottom: '0.5rem', color: 'var(--primary)' }} />
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No media files matching search filter.</p>
        </div>
      ) : (
        <div className={styles.gridMedia}>
          {paginatedFiles.map((file) => (
            <div key={file.id} className={styles.mediaItemCard}>
              <div className={styles.mediaImgWrap}>
                <img
                  src={file.url}
                  alt={file.name}
                  className={styles.mediaImg}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <span className={styles.mediaBadge}>{file.itemType}</span>
              </div>
              <div className={styles.mediaBody}>
                <span className={styles.mediaTitle} title={file.name}>
                  {file.name}
                </span>
                <div className={styles.mediaMeta}>
                  <span>SKU: {file.productSku}</span>
                  <span>~{file.sizeKb} KB</span>
                </div>
                <div className={styles.mediaActions}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                  >
                    <OpenInNewIcon fontSize="inherit" />
                    <span>View Full Image</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Custom Pagination */}
      <TablePagination
        totalItems={totalItems}
        pageSize={pageSize}
        currentPage={validCurrentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onExportCSV={handleExportCsv}
        onExportXLSX={handleExportExcel}
      />
    </div>
  );
}
