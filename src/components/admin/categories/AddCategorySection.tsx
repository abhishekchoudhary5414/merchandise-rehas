'use client';

import React, { useState, useRef } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import styles from './AddCategorySection.module.css';

interface AddCategorySectionProps {
  initialCategory?: any;
  onCancel: () => void;
  onSuccess: (category: any, isEdit: boolean) => void;
}

async function compressCategoryImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
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

export default function AddCategorySection({ initialCategory, onCancel, onSuccess }: AddCategorySectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(initialCategory?.id);
  const [name, setName] = useState(initialCategory?.name || '');
  const [description, setDescription] = useState(initialCategory?.description || '');
  const [imageUrl, setImageUrl] = useState(initialCategory?.imageUrl || '');
  const [localPreview, setLocalPreview] = useState('');
  const [driveFileId, setDriveFileId] = useState(initialCategory?.driveFileId || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressCategoryImage(file);
      const previewBlobUrl = URL.createObjectURL(compressed);
      setLocalPreview(previewBlobUrl);

      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('category', 'Categories');

      const res = await fetch('/api/admin/drive/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (driveFileId && !isEdit) {
        fetch('/api/admin/drive/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: driveFileId }),
        }).catch(() => {});
      }

      setImageUrl(data.url || data.thumbnail || '');
      setDriveFileId(data.fileId || '');
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function handleDeleteImage() {
    if (driveFileId && !isEdit) {
      fetch('/api/admin/drive/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: driveFileId }),
      }).catch(() => {});
    }
    setImageUrl('');
    setLocalPreview('');
    setDriveFileId('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      const endpoint = isEdit
        ? `/api/admin/categories/${initialCategory.id}`
        : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl || null,
          driveFileId: driveFileId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category');
      onSuccess(data.category, isEdit);
    } catch (err: any) {
      setError(err.message || 'Could not save category.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <button type="button" onClick={onCancel} className={styles.backBtn}>
          <ArrowBackIcon fontSize="small" />
          <span>Back</span>
        </button>
        <h2 className={styles.title}>{isEdit ? `Edit Category: ${initialCategory.name}` : 'Add New Category'}</h2>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.uploadBox}>
          <div className={styles.previewWrap}>
            {(localPreview || imageUrl) ? (
              <img
                src={localPreview || imageUrl}
                alt="Category preview"
                className={styles.previewImg}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (driveFileId && !target.src.includes('drive.google.com/thumbnail')) {
                    target.src = `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w800`;
                  }
                }}
              />
            ) : (
              <ImageOutlinedIcon style={{ color: 'var(--text-secondary)', fontSize: '2rem' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className={styles.uploadBtn}
              >
                <CloudUploadOutlinedIcon fontSize="small" />
                <span>{uploading ? 'Compressing & Uploading...' : 'Upload Category Image'}</span>
              </button>
              {(localPreview || imageUrl) && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  style={{
                    background: '#fef2f2',
                    color: 'var(--danger)',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.9rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                  <span>Delete Image</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste Google Drive image URL..."
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Category Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Crystal Bracelets, Rudraksha Mala, Yantras"
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Category Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this merchandise category..."
            className={styles.textarea}
          />
        </div>

        <div className={styles.footerActions}>
          <button type="button" onClick={onCancel} className={styles.backBtn}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={styles.submitBtn}>
            <SaveOutlinedIcon fontSize="small" />
            <span>{saving ? 'Saving to Neon DB...' : isEdit ? 'Update Category' : 'Save Category'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
