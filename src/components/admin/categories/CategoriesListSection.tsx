'use client';

import React, { useState } from 'react';
import CategoryIcon from '@mui/icons-material/Category';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCsv, exportToExcel } from '@/lib/export-utils';
import styles from './CategoriesListSection.module.css';

interface CategoriesListSectionProps {
  categories: any[];
  onAddCategory: () => void;
  onEditCategory: (cat: any) => void;
  onDeleteCategory: (cat: any) => void;
}

export default function CategoriesListSection({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoriesListSectionProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filtered.length;
  const effectivePageSize = pageSize === 'all' ? (totalItems || 1) : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginated = pageSize === 'all'
    ? filtered
    : filtered.slice((validCurrentPage - 1) * effectivePageSize, validCurrentPage * effectivePageSize);

  // Dynamic Metrics
  const totalProductsCount = categories.reduce((sum, c) => sum + (c._count?.products ?? 0), 0);
  const activeCategoriesCount = categories.length;

  function handleExportCsv() {
    exportToCsv(
      ['Category Name', 'Slug', 'Associated Products Count', 'Status'],
      filtered.map((c) => [c.name, c.slug, c._count?.products ?? 0, 'Active']),
      'rehas-categories.csv'
    );
  }

  function handleExportExcel() {
    exportToExcel(
      ['Category Name', 'Slug', 'Associated Products Count', 'Status'],
      filtered.map((c) => [c.name, c.slug, c._count?.products ?? 0, 'Active']),
      'rehas-categories.xls'
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <span className={styles.vedicTagline}>
            <CategoryIcon fontSize="inherit" />
            <span>Sacred Collection Taxonomies</span>
          </span>
          <h2 className={styles.mainTitle}>Merchandise Categories</h2>
          <p className={styles.mainSubtitle}>
            Natural crystal, sacred rudraksha &amp; astrological alignment collections consecrated by Vedic tradition
          </p>
        </div>

        <div className={styles.controlsArea}>
          <div className={styles.topStockBadge}>
            <LayersOutlinedIcon fontSize="small" style={{ color: 'var(--primary)' }} />
            <span>Total Categories:</span>
            <strong>{categories.length} Collections</strong>
          </div>

          <div className={styles.topExportGroup}>
            <span className={styles.topExportLabel}>Export:</span>
            <button type="button" onClick={handleExportCsv} className={styles.exportBtn}>
              CSV
            </button>
            <button type="button" onClick={handleExportExcel} className={styles.exportBtn}>
              Excel (XLSX)
            </button>
          </div>

          <button
            type="button"
            onClick={onAddCategory}
            className={styles.primaryBtn}
          >
            <AddCircleOutlineOutlinedIcon fontSize="small" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className={styles.cardsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FAF5FC', color: 'var(--primary)' }}>
            <LayersOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Categories</span>
            <span className={styles.statValue}>{activeCategoriesCount} Collections</span>
            <span className={styles.statSub}>Configured sacred taxonomies</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <Inventory2OutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Associated Products</span>
            <span className={styles.statValue} style={{ color: '#16A34A' }}>{totalProductsCount} Items</span>
            <span className={styles.statSub}>Assigned to category collections</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <AutoAwesomeOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Vedic Alignment</span>
            <span className={styles.statValue} style={{ color: '#D97706' }}>100% Consecrated</span>
            <span className={styles.statSub}>Rudraksha &amp; Chakra remedies</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FAF7FB', color: 'var(--secondary)' }}>
            <CheckCircleOutlineOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Collection Status</span>
            <span className={styles.statValue}>Live &amp; Synced</span>
            <span className={styles.statSub}>Neon PostgreSQL Database</span>
          </div>
        </div>
      </div>

      {/* 3. Controls & Search Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <SearchIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search categories by name, slug or crystal style..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 4. Categories Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Banner</th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Associated Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-secondary)' }}>
                    No merchandise categories found matching search.
                  </td>
                </tr>
              ) : (
                paginated.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <img
                        src={cat.imageUrl || '/images/rehas-logo.png'}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className={styles.catBannerImg}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/rehas-logo.png'; }}
                      />
                    </td>
                    <td>
                      <span className={styles.catNameText}>{cat.name}</span>
                    </td>
                    <td>
                      <span className={styles.slugTag}>/{cat.slug}</span>
                    </td>
                    <td>
                      <span className={styles.productCountBadge}>
                        <Inventory2OutlinedIcon fontSize="inherit" />
                        <span>{cat._count?.products ?? 0} Products</span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.badgeSuccess}>Active</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => onEditCategory(cat)}
                          style={{
                            background: '#FAF5FC',
                            color: 'var(--primary)',
                            border: '1px solid rgba(86, 0, 103, 0.2)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                          }}
                        >
                          <EditOutlinedIcon fontSize="inherit" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat)}
                          style={{
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                          }}
                        >
                          <DeleteOutlinedIcon fontSize="inherit" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
