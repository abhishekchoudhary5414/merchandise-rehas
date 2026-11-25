'use client';

import React, { useState, useEffect, useRef } from 'react';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCsv, exportToExcel } from '@/lib/export-utils';
import styles from './BlogsSection.module.css';

interface BlogArticle {
  id: string;
  title: string;
  slug?: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
  tags?: string;
  published: boolean;
  createdAt: string;
}

// Client-side image compression before Google Drive upload
async function compressImageForDrive(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1200;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressed = new File([blob], `${baseName}.webp`, { type: 'image/webp' });
          resolve(compressed.size < file.size ? compressed : file);
        },
        'image/webp',
        0.82
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export default function BlogsSection() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  // Form & Editing state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Vedic Wisdom');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('Astro Acharya - REHAS');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadBlogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blogs');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.blogs || []);
      } else {
        setArticles([]);
      }
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // 1. Compress image to optimized webp
      const compressed = await compressImageForDrive(file);

      // 2. Upload to Google Drive
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('category', 'Vedic-Blogs');

      const res = await fetch('/api/admin/drive/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image to Google Drive');

      setFormImageUrl(data.url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error uploading image to Google Drive');
    } finally {
      setUploadingImage(false);
    }
  }

  function handleOpenCreate() {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('Vedic Wisdom');
    setFormSummary('');
    setFormContent('');
    setFormAuthor('Astro Acharya - REHAS');
    setFormImageUrl('');
    setShowForm(true);
  }

  function handleOpenEdit(art: BlogArticle) {
    setEditingId(art.id);
    setFormTitle(art.title);
    setFormCategory(art.tags || 'Vedic Wisdom');
    setFormSummary(art.summary);
    setFormContent(art.content || art.summary);
    setFormAuthor(art.author || 'Astro Acharya - REHAS');
    setFormImageUrl(art.imageUrl || '');
    setShowForm(true);
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) return;

    setSavingArticle(true);
    try {
      if (editingId) {
        // Edit existing article
        const res = await fetch(`/api/admin/blogs/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            summary: formSummary,
            content: formContent || formSummary,
            imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
            author: formAuthor,
            tags: formCategory,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update article');

        setArticles((prev) =>
          prev.map((a) => (a.id === editingId ? data.blog : a))
        );
      } else {
        // Create new article
        const res = await fetch('/api/admin/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            summary: formSummary,
            content: formContent || formSummary,
            imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
            author: formAuthor,
            tags: formCategory,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create article');

        setArticles((prev) => [data.blog, ...prev]);
      }
      setShowForm(false);
    } catch (err: any) {
      alert(err.message || 'Could not save article');
    } finally {
      setSavingArticle(false);
    }
  }

  async function handleDeleteArticle(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete article "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete article');
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Could not delete article');
    }
  }

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.tags && a.tags.toLowerCase().includes(search.toLowerCase())) ||
      a.summary.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filteredArticles.length;
  const effectivePageSize = pageSize === 'all' ? (totalItems || 1) : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedArticles = pageSize === 'all'
    ? filteredArticles
    : filteredArticles.slice((validCurrentPage - 1) * effectivePageSize, validCurrentPage * effectivePageSize);

  function handleExportCsv() {
    exportToCsv(
      ['Article Title', 'Category', 'Author', 'Publish Date', 'Summary'],
      filteredArticles.map((a) => [a.title, a.tags || 'Vedic Wisdom', a.author, a.createdAt, a.summary]),
      'rehas-vedic-articles.csv'
    );
  }

  function handleExportExcel() {
    exportToExcel(
      ['Article Title', 'Category', 'Author', 'Publish Date', 'Summary'],
      filteredArticles.map((a) => [a.title, a.tags || 'Vedic Wisdom', a.author, a.createdAt, a.summary]),
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
            Publish, edit &amp; manage consecrated gemstone wisdom with Google Drive compressed media synchronization
          </p>
        </div>

        <div className={styles.controlsArea}>
          <div className={styles.topStockBadge}>
            <MenuBookOutlinedIcon fontSize="small" style={{ color: 'var(--primary)' }} />
            <span>Published Wisdom:</span>
            <strong>{articles.length} Articles</strong>
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
            onClick={loadBlogs}
            disabled={loading}
            className={styles.exportBtn}
            style={{ padding: '8px 14px' }}
            title="Refresh articles"
          >
            <RefreshIcon fontSize="small" />
            <span>{loading ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className={styles.primaryBtn}
          >
            <AddCircleOutlineOutlinedIcon fontSize="small" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className={styles.cardsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FAF5FC', color: 'var(--primary)' }}>
            <MenuBookOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Articles</span>
            <span className={styles.statValue}>{articles.length} Guides</span>
            <span className={styles.statSub}>Neon PostgreSQL Database</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <CheckCircleOutlineOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Live Status</span>
            <span className={styles.statValue} style={{ color: '#16A34A' }}>100% Active</span>
            <span className={styles.statSub}>Visible to boutique patrons</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <CloudUploadOutlinedIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Drive Media Vault</span>
            <span className={styles.statValue} style={{ color: '#D97706' }}>WebP Compressed</span>
            <span className={styles.statSub}>Stored in Google Drive folder</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#FAF7FB', color: 'var(--secondary)' }}>
            <AutoAwesomeIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Vedic Alignment</span>
            <span className={styles.statValue}>Astrological</span>
            <span className={styles.statSub}>Energy &amp; Planetary Wisdom</span>
          </div>
        </div>
      </div>

      {/* 3. Article Creator / Editor Form Modal Card */}
      {showForm && (
        <form onSubmit={handleSubmitForm} className={styles.formCard}>
          <div className={styles.formHeader}>
            <ArticleIcon fontSize="small" />
            <span>{editingId ? 'Edit Consecrated Article' : 'Publish Sacred Knowledge Article'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                Article Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cleansing Your Black Tourmaline Under Moon Shadows"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid rgba(86, 0, 103, 0.2)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                Vedic Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid rgba(86, 0, 103, 0.2)' }}
              >
                <option value="Vedic Wisdom">Vedic Wisdom</option>
                <option value="Crystal Energies">Crystal Energies</option>
                <option value="Sanctified Lifestyle">Sanctified Lifestyle</option>
                <option value="Planetary Alignments">Planetary Alignments</option>
                <option value="Chakra Healing">Chakra Healing</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
              Article Summary / Excerpt *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Spiritual essence and guidance for patrons..."
              value={formSummary}
              onChange={(e) => setFormSummary(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid rgba(86, 0, 103, 0.2)' }}
            />
          </div>

          {/* Compressed Google Drive Image Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
              Cover Image (Compressed WebP &amp; Uploaded to Google Drive)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFileChange}
            />

            <div
              className={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingImage ? (
                <span>Compressing &amp; Uploading to Google Drive...</span>
              ) : formImageUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={formImageUrl} alt="Preview" className={styles.previewThumb} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#16A34A', fontWeight: 700, fontSize: '13px' }}>
                      ✓ Image compressed &amp; synced on Google Drive
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>Click to replace with another image</span>
                  </div>
                </div>
              ) : (
                <>
                  <CloudUploadOutlinedIcon fontSize="large" style={{ color: 'var(--primary)', opacity: 0.8 }} />
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--primary)' }}>
                    Click to upload cover image
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Automatically converted to lightweight WebP before storing on Google Drive
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ padding: '9px 18px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingArticle || uploadingImage}
              className={styles.primaryBtn}
            >
              <span>{savingArticle ? 'Saving Article...' : editingId ? 'Update Article' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Controls & Filter Bar */}
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
      </div>

      {/* 5. Articles Grid with Edit and Delete options */}
      <div className={styles.gridArticles}>
        {paginatedArticles.map((art) => (
          <div key={art.id} className={styles.articleCard}>
            <img src={art.imageUrl} alt={art.title} className={styles.articleCover} />
            <div className={styles.articleBody}>
              <span className={styles.articleCategory}>{art.tags || 'Vedic Wisdom'}</span>
              <h3 className={styles.articleTitle}>{art.title}</h3>
              <p className={styles.articleExcerpt}>{art.summary}</p>
              <div className={styles.articleFooter}>
                <span>By {art.author}</span>
                <span>5 min read</span>
              </div>
              <div className={styles.actionBtnGroup}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(art)}
                  className={styles.editBtn}
                >
                  <EditOutlinedIcon fontSize="inherit" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteArticle(art.id, art.title)}
                  className={styles.delBtn}
                >
                  <DeleteOutlinedIcon fontSize="inherit" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Custom Pagination */}
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
