'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileSpreadsheet, Download } from 'lucide-react';
import styles from './TablePagination.module.css';

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number | 'all';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number | 'all') => void;
  onExportCSV?: () => void;
  onExportXLSX?: () => void;
}

export default function TablePagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onExportCSV,
  onExportXLSX,
}: TablePaginationProps) {
  const isAll = pageSize === 'all';
  const numericSize = isAll ? totalItems : pageSize;
  const totalPages = isAll || totalItems === 0 ? 1 : Math.ceil(totalItems / (pageSize as number));

  const startItem = totalItems === 0 ? 0 : isAll ? 1 : (currentPage - 1) * (pageSize as number) + 1;
  const endItem = isAll ? totalItems : Math.min(currentPage * (pageSize as number), totalItems);

  return (
    <div className={styles.paginationContainer}>
      {/* Left: Export Buttons */}
      <div className={styles.exportControls}>
        <span className={styles.exportLabel}>Export:</span>
        {onExportCSV && (
          <button
            type="button"
            onClick={onExportCSV}
            className={styles.exportBtn}
            title="Download CSV Spreadsheet"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>
        )}
        {onExportXLSX && (
          <button
            type="button"
            onClick={onExportXLSX}
            className={`${styles.exportBtn} ${styles.exportXlsx}`}
            title="Download Microsoft Excel (XLSX) File"
          >
            <FileSpreadsheet size={13} />
            <span>Excel (XLSX)</span>
          </button>
        )}
      </div>

      {/* Right: Items per page & Page Navigation */}
      <div className={styles.navControls}>
        {/* Page Size Selector */}
        <div className={styles.pageSizeWrap}>
          <span className={styles.pageSizeLabel}>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
              onPageSizeChange(val);
              onPageChange(1);
            }}
            className={styles.pageSizeSelect}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All ({totalItems})</option>
          </select>
        </div>

        {/* Counter Info */}
        <span className={styles.rangeInfo}>
          {totalItems === 0 ? '0 of 0' : `${startItem}–${endItem} of ${totalItems}`}
        </span>

        {/* Navigation Buttons */}
        {!isAll && totalPages > 1 && (
          <div className={styles.pageButtons}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(1)}
              className={styles.navArrow}
              title="First Page"
            >
              <ChevronsLeft size={15} />
            </button>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className={styles.navArrow}
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            <span className={styles.pageNum}>
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className={styles.navArrow}
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(totalPages)}
              className={styles.navArrow}
              title="Last Page"
            >
              <ChevronsRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
