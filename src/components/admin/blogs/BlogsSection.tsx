'use client';

import React, { useState } from 'react';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCsv, exportToExcel } from '@/lib/export-utils';
import styles from './BlogsSection.module.css';

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  publishDate: string;
  imageUrl: string;
  author: string;
}

const DEFAULT_ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'The Sacred Science of 108 Rudraksha Beads in Japa Sadhana',
    category: 'Vedic Wisdom',
    excerpt: 'Discover why 108 is the cosmic numerical frequency connecting the distance between Earth, Sun, and planetary chakra points.',
    readTime: '6 min read',
    publishDate: 'Nov 20, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
    author: 'Vedic Astrologer Shastriji',
  },
  {
    id: 'art-2',
    title: 'How Natural Tiger Eye Protects Your Aura from Negative Energies',
    category: 'Crystal Energies',
    excerpt: 'A comprehensive guide on cleansing, charging under full moon illumination, and wearing Solar Plexus chakra energizers.',
    readTime: '4 min read',
    publishDate: 'Nov 18, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    author: 'REHAS Energy Council',
  },
  {
    id: 'art-3',
    title: 'Consecration Rituals: The Difference Between Plain and Blessed Jewelry',
    category: 'Sanctified Lifestyle',
    excerpt: 'Understanding the sacred Prana Pratishtha process, Vedic mantras, and how consecrated spiritual merchandise uplifts mental clarity.',
    readTime: '8 min read',
    publishDate: 'Nov 14, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
    author: 'Vedic Research Wing',
  },
];

export default function BlogsSection() {
  const [articles, setArticles] = useState<ArticleItem[]>(DEFAULT_ARTICLES);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Vedic Wisdom');
  const [newExcerpt, setNewExcerpt] = useState('');

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filteredArticles.length;
  const effectivePageSize = pageSize === 'all' ? (totalItems || 1) : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedArticles = pageSize === 'all'
    ? filteredArticles
    : filteredArticles.slice((validCurrentPage - 1) * effectivePageSize, validCurrentPage * effectivePageSize);

  function handleCreateArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newArt: ArticleItem = {
      id: `art-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      excerpt: newExcerpt.trim() || 'Sacred wisdom for energized living and spiritual mindfulness.',
      readTime: '5 min read',
      publishDate: 'Just now',
      imageUrl: 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
      author: 'REHAS Editorial',
    };

    setArticles([newArt, ...articles]);
    setNewTitle('');
    setNewExcerpt('');
    setShowNewModal(false);
  }

  function handleExportCsv() {
    exportToCsv(
      ['Article Title', 'Category', 'Author', 'Publish Date', 'Read Time'],
      filteredArticles.map((a) => [a.title, a.category, a.author, a.publishDate, a.readTime]),
      'rehas-vedic-articles.csv'
    );
  }

  function handleExportExcel() {
    exportToExcel(
      ['Article Title', 'Category', 'Author', 'Publish Date', 'Read Time'],
      filteredArticles.map((a) => [a.title, a.category, a.author, a.publishDate, a.readTime]),
      'rehas-vedic-articles.xls'
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <span className={styles.vedicTagline}>
            <AutoAwesomeIcon fontSize="inherit" />
            <span>Sacred Knowledge &amp; Spiritual Wisdom</span>
          </span>
          <h2 className={styles.mainTitle}>Vedic Astrology &amp; Energy Articles</h2>
          <p className={styles.mainSubtitle}>
            Publish consecrated wisdom, gemstone care guidance &amp; astrological planetary insights for patrons
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal((v) => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #3D0049 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(86, 0, 103, 0.2)',
          }}
        >
          <AddCircleOutlineOutlinedIcon fontSize="small" />
          <span>{showNewModal ? 'Close Form' : 'Write New Article'}</span>
        </button>
      </div>

      {/* 2. New Article Creator Panel */}
      {showNewModal && (
        <form
          onSubmit={handleCreateArticle}
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(86, 0, 103, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 4px 16px rgba(86, 0, 103, 0.06)',
          }}
        >
          <h3 style={{ margin: 0, color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
            Publish Sacred Knowledge Article
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                Article Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cleansing Your Black Tourmaline Under Moon Shadows"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                Vedic Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}
              >
                <option value="Vedic Wisdom">Vedic Wisdom</option>
                <option value="Crystal Energies">Crystal Energies</option>
                <option value="Sanctified Lifestyle">Sanctified Lifestyle</option>
                <option value="Planetary Alignments">Planetary Alignments</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Brief Excerpt / Summary
            </label>
            <textarea
              rows={3}
              placeholder="Spiritual essence and guidance for patrons..."
              value={newExcerpt}
              onChange={(e) => setNewExcerpt(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowNewModal(false)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Publish Article
            </button>
          </div>
        </form>
      )}

      {/* 3. Controls & Filter Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <SearchIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search articles by title or Vedic topic..."
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

      {/* 4. Articles Grid */}
      <div className={styles.gridArticles}>
        {paginatedArticles.map((art) => (
          <div key={art.id} className={styles.articleCard}>
            <img src={art.imageUrl} alt={art.title} className={styles.articleCover} />
            <div className={styles.articleBody}>
              <span className={styles.articleCategory}>{art.category}</span>
              <h3 className={styles.articleTitle}>{art.title}</h3>
              <p className={styles.articleExcerpt}>{art.excerpt}</p>
              <div className={styles.articleFooter}>
                <span>By {art.author}</span>
                <span>{art.readTime}</span>
              </div>
            </div>
          </div>
        ))}
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
