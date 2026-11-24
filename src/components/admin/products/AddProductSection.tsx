'use client';

import React, { useState, useRef, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import styles from './AddProductSection.module.css';

function generateSku(productName: string): string {
  const words = productName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  let prefix = 'PRD';
  if (words.length >= 2) {
    prefix = words
      .slice(0, 3)
      .map((w) => w[0])
      .join('');
  } else if (words.length === 1 && words[0].length >= 2) {
    prefix = words[0].slice(0, 3);
  }
  const num = Math.floor(1000 + Math.random() * 9000);
  return `RH-${prefix}-${num}`;
}

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Compresses an image file client-side using HTML5 Canvas (max 1600px, WebP 82% quality)
 * for fast storefront loading before uploading to Google Drive.
 */
async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 1600;
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
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressed = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressed.size < file.size ? compressed : file);
        },
        'image/webp',
        0.82
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

interface MediaItem {
  id: string;
  url: string;
  previewUrl?: string;
  type: 'image' | 'video';
  name: string;
  fileId?: string;
}

interface AddProductSectionProps {
  initialProduct?: any;
  onCancel: () => void;
  onSuccess: (product: any, isEdit: boolean) => void;
}

export default function AddProductSection({ initialProduct, onCancel, onSuccess }: AddProductSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const isEdit = Boolean(initialProduct?.id);
  const sc = (initialProduct?.structuredContent as any) || {};

  // Basic
  const [name, setName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(() => initialProduct?.sku || generateSku(initialProduct?.name || ''));
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(Boolean(initialProduct?.sku));
  const [stockQuantity, setStockQuantity] = useState(
    initialProduct?.stockQuantity !== undefined ? String(initialProduct.stockQuantity) : '20'
  );
  const [categoryId, setCategoryId] = useState<string>(initialProduct?.categoryId || '');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories) {
            setCategories(data.categories);
            if (!initialProduct?.categoryId && data.categories.length > 0) {
              setCategoryId(data.categories[0].id);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    }
    loadCategories();
  }, [initialProduct?.categoryId]);

  // Media (Google Drive - Multiple Images & Videos)
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    if (Array.isArray(sc.media) && sc.media.length > 0) {
      return sc.media;
    }
    if (initialProduct?.primaryImage) {
      return [
        {
          id: 'existing-primary',
          url: initialProduct.primaryImage,
          type: 'image',
          name: initialProduct.name || 'Primary Image',
        },
      ];
    }
    return [];
  });
  const [manualUrl, setManualUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // 3-Tier Pricing
  const [rootPrice, setRootPrice] = useState(
    initialProduct?.rootPrice ? String(initialProduct.rootPrice) : initialProduct?.price ? String(initialProduct.price) : '799'
  );
  const [auraPrice, setAuraPrice] = useState(
    initialProduct?.auraPrice ? String(initialProduct.auraPrice) : '1199'
  );
  const [divinePrice, setDivinePrice] = useState(
    initialProduct?.divinePrice ? String(initialProduct.divinePrice) : '1599'
  );

  // Energy Activation Ritual
  const [energyRitualPrice, setEnergyRitualPrice] = useState(
    initialProduct?.energyRitualPrice !== undefined ? String(initialProduct.energyRitualPrice) : '150'
  );
  const [energyRitualDesc, setEnergyRitualDesc] = useState(
    initialProduct?.energyRitualDesc ||
      'Your bracelet will be purified and energized through sacred rituals to enhance protection, confidence, and success energy.'
  );

  // Astrology
  const [zodiacSigns, setZodiacSigns] = useState(initialProduct?.zodiacSigns || '');
  const [rulingPlanet, setRulingPlanet] = useState(initialProduct?.rulingPlanet || '');
  const [mulankNumber, setMulankNumber] = useState(initialProduct?.mulankNumber || '');

  // Structured Content
  const [productSummary, setProductSummary] = useState(sc.productSummary || initialProduct?.description || '');
  const [keyFeatures, setKeyFeatures] = useState(
    Array.isArray(sc.keyFeatures) ? sc.keyFeatures.join('\n') : ''
  );
  const [benefits, setBenefits] = useState(
    Array.isArray(sc.benefits) ? sc.benefits.join('\n') : ''
  );
  const [bestFor, setBestFor] = useState(sc.bestFor || '');
  const [emotionalHook, setEmotionalHook] = useState(sc.emotionalHook || initialProduct?.shortDescription || '');
  const [careInstructions, setCareInstructions] = useState(
    Array.isArray(sc.careInstructions) ? sc.careInstructions.join('\n') : ''
  );
  const [howToUse, setHowToUse] = useState(
    Array.isArray(sc.howToUse) ? sc.howToUse.join('\n') : ''
  );
  const [material, setMaterial] = useState(sc.specifications?.material || initialProduct?.primaryCrystal || '');
  const [beadType, setBeadType] = useState(sc.specifications?.beadType || 'Round Polished Beads');
  const [size, setSize] = useState(sc.specifications?.size || 'Free Size (Elastic)');
  const [weight, setWeight] = useState(sc.specifications?.weight || 'Light to Medium');
  const [origin, setOrigin] = useState(sc.specifications?.origin || 'India/South Africa');
  const [trustBadges, setTrustBadges] = useState(
    Array.isArray(sc.trustBadges)
      ? sc.trustBadges.join('\n')
      : '100% Natural Stone\nHandcrafted with Care\nSkin-Friendly & Durable\nTrusted by 300+ Customers'
  );
  const [spiritualSignificance, setSpiritualSignificance] = useState(
    Array.isArray(sc.spiritualSignificance) ? sc.spiritualSignificance.join('\n') : ''
  );
  const [faqList, setFaqList] = useState<FaqItem[]>(() => {
    if (Array.isArray(sc.faqs) && sc.faqs.length > 0) {
      return sc.faqs;
    }
    return [{ question: '', answer: '' }];
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadTigerEyeTemplate() {
    setName('Tiger Eye Bracelet');
    setSku('RH-TEB-' + Math.floor(100 + Math.random() * 900));
    setZodiacSigns('Leo');
    setRulingPlanet('Sun');
    setMulankNumber('4');
    setRootPrice('799');
    setAuraPrice('1199');
    setDivinePrice('1599');
    setEnergyRitualPrice('150');
    setEnergyRitualDesc(
      'Your bracelet will be purified and energized through sacred rituals to enhance protection, confidence, and success energy.'
    );
    setProductSummary(
      'This Tiger Eye Bracelet is crafted from high-quality natural tiger eye stones known for their golden-brown color and unique silky shine. It is considered a powerful protection stone that helps shield against negative energy while boosting confidence and courage. Tiger Eye is also associated with attracting wealth and improving decision-making abilities. Each bead is polished to perfection and strung on a durable elastic band for comfortable daily wear. Perfect for individuals seeking strength, protection, and success.'
    );
    setKeyFeatures(
      'Premium quality natural Tiger Eye stones\nUnique golden-brown striped pattern (chatoyancy effect)\nStrong protection and confidence-enhancing properties\nStretchable, durable, and skin-friendly\nHandcrafted with precision\nOptional energy activation ritual available'
    );
    setBenefits(
      'Boosts confidence and personal power\nProtects from negative energy and evil eye\nEnhances focus and decision-making ability\nAttracts wealth and financial opportunities\nStrengthens courage and willpower\nPromotes mental clarity and stability'
    );
    setBestFor(
      'Wear daily on the left hand for protection and confidence. Ideal for business, career growth, leadership, and decision-making situations.'
    );
    setEmotionalHook(
      'Unlock your inner strength, stay protected, and attract success with the powerful energy of Tiger Eye.'
    );
    setCareInstructions(
      'Clean with a soft dry cloth\nAvoid water and harsh chemicals\nStore in a clean and dry place\nRecharge under sunlight or moonlight occasionally'
    );
    setHowToUse(
      'Wear daily on the left wrist for best results\nUse during important meetings or business decisions\nSet intentions for protection and success\nIdeal for professionals, entrepreneurs, and students'
    );
    setMaterial('Natural Tiger Eye Stone');
    setBeadType('Round Polished Beads');
    setSize('Free Size (Elastic)');
    setWeight('Light to Medium');
    setOrigin('India/South Africa');
    setTrustBadges(
      '100% Natural Stone\nHandcrafted with Care\nSkin-Friendly & Durable\nTrusted by 300+ Customers'
    );
    setSpiritualSignificance(
      'Known as the stone of protection and courage\nAssociated with the Solar Plexus Chakra (Manipura)\nEnhances inner strength and confidence\nBalances energy and promotes stability'
    );
    setFaqList([
      {
        question: 'Is this real Tiger Eye?',
        answer: 'Yes, it is made from natural Tiger Eye stones with unique natural patterns.',
      },
      {
        question: 'What is Tiger Eye used for?',
        answer: 'Tiger Eye is believed to provide protection, boost confidence, and attract success.',
      },
      {
        question: 'Can I wear it daily?',
        answer: 'Yes, it is comfortable and suitable for everyday wear.',
      },
      {
        question: 'Will it fit my wrist?',
        answer: 'Yes, it is stretchable and fits most wrist sizes comfortably.',
      },
    ]);
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const folderName = (name.trim() || 'Product-Uploads').replace(/[^a-zA-Z0-9 _-]/g, '');
    setUploadingImage(true);
    setError(null);

    try {
      const uploaded: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        const fileToUpload = rawFile.type.startsWith('image/')
          ? await compressImageFile(rawFile)
          : rawFile;

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('category', folderName);

        const res = await fetch('/api/admin/drive/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Upload failed for ${fileToUpload.name}`);

        uploaded.push({
          id: `${Date.now()}-${i}`,
          url: data.url || data.thumbnail || '',
          previewUrl: URL.createObjectURL(fileToUpload),
          type: fileToUpload.type.startsWith('video/') ? 'video' : 'image',
          name: fileToUpload.name,
          fileId: data.fileId,
        });
      }
      setMediaList((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      setError(err.message || 'Media upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function moveMedia(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= mediaList.length) return;
    setMediaList((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  }

  function removeMedia(index: number) {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleReplaceMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || replaceIndex === null) return;

    const folderName = (name.trim() || 'Product-Uploads').replace(/[^a-zA-Z0-9 _-]/g, '');
    setUploadingImage(true);
    setError(null);

    try {
      const fileToUpload = file.type.startsWith('image/')
        ? await compressImageFile(file)
        : file;

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('category', folderName);

      const res = await fetch('/api/admin/drive/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Upload failed for ${fileToUpload.name}`);

      const oldItem = mediaList[replaceIndex];
      // If replacing a newly uploaded file (not yet saved in DB), delete it immediately from Google Drive
      if (oldItem?.fileId && !isEdit) {
        fetch('/api/admin/drive/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: oldItem.fileId }),
        }).catch(() => {});
      }

      setMediaList((prev) =>
        prev.map((item, idx) =>
          idx === replaceIndex
            ? {
                id: `${Date.now()}-${idx}`,
                url: data.url || data.thumbnail || '',
                type: fileToUpload.type.startsWith('video/') ? 'video' : 'image',
                name: fileToUpload.name,
                fileId: data.fileId,
              }
            : item
        )
      );
    } catch (err: any) {
      setError(err.message || 'Replace media failed');
    } finally {
      setUploadingImage(false);
      setReplaceIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  }

  function addManualMediaUrl() {
    if (!manualUrl.trim()) return;
    const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(manualUrl.trim());
    setMediaList((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        url: manualUrl.trim(),
        type: isVideo ? 'video' : 'image',
        name: 'External Media',
      },
    ]);
    setManualUrl('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !sku.trim()) {
      setError('Product Name and SKU are required.');
      return;
    }

    setSubmitting(true);
    try {
      const structuredContent = {
        productSummary,
        keyFeatures: String(keyFeatures).split('\n').map((s: string) => s.trim()).filter(Boolean),
        benefits: String(benefits).split('\n').map((s: string) => s.trim()).filter(Boolean),
        bestFor,
        emotionalHook,
        careInstructions: String(careInstructions).split('\n').map((s: string) => s.trim()).filter(Boolean),
        howToUse: String(howToUse).split('\n').map((s: string) => s.trim()).filter(Boolean),
        specifications: { material, beadType, size, weight, origin },
        trustBadges: String(trustBadges).split('\n').map((s: string) => s.trim()).filter(Boolean),
        spiritualSignificance: String(spiritualSignificance).split('\n').map((s: string) => s.trim()).filter(Boolean),
        faqs: faqList
          .map((item) => ({
            question: item.question.trim(),
            answer: item.answer.trim(),
          }))
          .filter((item) => item.question && item.answer),
        media: mediaList.map((m, idx) => ({
          id: m.id,
          url: m.url,
          type: m.type,
          name: m.name,
          fileId: m.fileId,
          position: idx + 1,
        })),
      };

      const firstImage = mediaList.find((m) => m.type === 'image')?.url || mediaList[0]?.url || '/images/rehas-logo.png';

      const endpoint = isEdit
        ? `/api/admin/products/${initialProduct.id}`
        : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          sku: sku.trim(),
          categoryId: categoryId || undefined,
          shortDescription: emotionalHook || productSummary.slice(0, 140),
          description: productSummary,
          price: Number(rootPrice) || 799,
          rootPrice: Number(rootPrice) || 799,
          auraPrice: Number(auraPrice) || 1199,
          divinePrice: Number(divinePrice) || 1599,
          energyRitualPrice: Number(energyRitualPrice) || 150,
          energyRitualDesc,
          zodiacSigns,
          rulingPlanet,
          mulankNumber,
          primaryCrystal: material,
          stockQuantity: Number(stockQuantity) || 20,
          primaryImage: firstImage,
          structuredContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      onSuccess(data.product, isEdit);
    } catch (err: any) {
      setError(err.message || 'Could not save product.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <button type="button" onClick={onCancel} className={styles.backBtn}>
            <ArrowBackIcon fontSize="small" />
            <span>Back</span>
          </button>
          <h2 className={styles.title}>{isEdit ? `Edit Product: ${initialProduct.name}` : 'Add New Product'}</h2>
        </div>

        <button type="button" onClick={loadTigerEyeTemplate} className={styles.templateBtn}>
          <AutoAwesomeOutlinedIcon fontSize="small" />
          <span>Load Tiger Eye Sample</span>
        </button>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 1. Multiple Images & Videos Upload to Google Drive (Bracelet Folder) */}
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionHeading}>
            <ImageOutlinedIcon fontSize="small" />
            Product Images &amp; Videos (Google Drive Folder: {name.trim() || 'Product-Uploads'})
          </h3>
          <div className={styles.uploadRow}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaUpload}
              style={{ display: 'none' }}
            />
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleReplaceMedia}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className={styles.uploadBtn}
            >
              <CloudUploadOutlinedIcon fontSize="small" />
              <span>{uploadingImage ? 'Compressing & Uploading to Google Drive...' : 'Upload Images / Videos'}</span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Or paste Google Drive image/video URL..."
                className={styles.input}
              />
              <button type="button" onClick={addManualMediaUrl} className={styles.backBtn}>
                Add URL
              </button>
            </div>
          </div>

          {mediaList.length > 0 && (
            <div className={styles.mediaGrid}>
              {mediaList.map((item, index) => (
                <div key={item.id} className={styles.mediaCard}>
                  <div className={styles.mediaThumbWrap}>
                    {item.type === 'video' ? (
                      <video src={item.previewUrl || item.url} className={styles.mediaThumb} controls muted />
                    ) : (
                      <img
                        src={item.previewUrl || item.url}
                        alt={item.name}
                        className={styles.mediaThumb}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (item.fileId && !target.src.includes('drive.google.com/thumbnail')) {
                            target.src = `https://drive.google.com/thumbnail?id=${item.fileId}&sz=w800`;
                          }
                        }}
                      />
                    )}
                    <span className={styles.posBadge}>
                      #{index + 1} {index === 0 ? 'Primary' : ''}
                    </span>
                  </div>
                  <div className={styles.mediaActions}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => moveMedia(index, -1)}
                        disabled={index === 0}
                        className={styles.iconActionBtn}
                        title="Move Left"
                      >
                        <ArrowBackIcon fontSize="inherit" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMedia(index, 1)}
                        disabled={index === mediaList.length - 1}
                        className={styles.iconActionBtn}
                        title="Move Right"
                      >
                        <ArrowForwardIcon fontSize="inherit" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceIndex(index);
                          replaceInputRef.current?.click();
                        }}
                        className={styles.iconActionBtn}
                        title="Replace Media (Auto-deletes old from Drive)"
                        style={{ fontSize: '0.68rem', padding: '2px 6px', fontWeight: 600 }}
                      >
                        Replace
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className={`${styles.iconActionBtn} ${styles.deleteActionBtn}`}
                      title="Remove"
                    >
                      <DeleteOutlinedIcon fontSize="inherit" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Basic Info & Astrology */}
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionHeading}>Basic Info &amp; Astrology Alignment</h3>
          <div className={styles.grid3}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  if (!isEdit && !skuManuallyEdited) {
                    setSku(generateSku(val));
                  }
                }}
                placeholder="e.g. Tiger Eye Bracelet"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>SKU * (Auto-Generated)</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    setSkuManuallyEdited(true);
                  }}
                  placeholder="RH-PRD-1234"
                  className={styles.input}
                  style={{ fontFamily: 'monospace', fontWeight: 600 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSku(generateSku(name));
                    setSkuManuallyEdited(false);
                  }}
                  className={styles.backBtn}
                  title="Regenerate SKU"
                  style={{ padding: '0 0.6rem', flexShrink: 0 }}
                >
                  <RefreshIcon fontSize="small" />
                </button>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Stock Quantity</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Product Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={styles.input}
                required
              >
                {categories.length === 0 && <option value="">Loading categories...</option>}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Zodiac Sign</label>
              <input
                type="text"
                value={zodiacSigns}
                onChange={(e) => setZodiacSigns(e.target.value)}
                placeholder="e.g. Leo"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Planet</label>
              <input
                type="text"
                value={rulingPlanet}
                onChange={(e) => setRulingPlanet(e.target.value)}
                placeholder="e.g. Sun"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Mulank</label>
              <input
                type="text"
                value={mulankNumber}
                onChange={(e) => setMulankNumber(e.target.value)}
                placeholder="e.g. 4"
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* 3. Three-Tier Pricing & Energy Activation Ritual */}
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionHeading}>
            <CurrencyRupeeIcon fontSize="small" />
            Pricing Tiers (Root, Aura, Divine) &amp; Energy Ritual
          </h3>
          <div className={styles.grid3} style={{ marginBottom: '1rem' }}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Root Price (₹)</label>
              <input
                type="number"
                required
                value={rootPrice}
                onChange={(e) => setRootPrice(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Aura Price (₹)</label>
              <input
                type="number"
                required
                value={auraPrice}
                onChange={(e) => setAuraPrice(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Divine Price (₹)</label>
              <input
                type="number"
                required
                value={divinePrice}
                onChange={(e) => setDivinePrice(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.ritualBox}>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Add Energy Activation Ritual (+ ₹)</label>
                <input
                  type="number"
                  value={energyRitualPrice}
                  onChange={(e) => setEnergyRitualPrice(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Ritual Description</label>
                <input
                  type="text"
                  value={energyRitualDesc}
                  onChange={(e) => setEnergyRitualDesc(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Product Summary, Emotional Hook & Best For */}
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionHeading}>Product Summary &amp; Highlights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Product Summary</label>
              <textarea
                rows={4}
                value={productSummary}
                onChange={(e) => setProductSummary(e.target.value)}
                placeholder="Describe the stone, craftsmanship, and spiritual purpose..."
                className={styles.textarea}
              />
            </div>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Emotional Hook</label>
                <input
                  type="text"
                  value={emotionalHook}
                  onChange={(e) => setEmotionalHook(e.target.value)}
                  placeholder="Unlock your inner strength..."
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Best For</label>
                <input
                  type="text"
                  value={bestFor}
                  onChange={(e) => setBestFor(e.target.value)}
                  placeholder="Wear daily on the left hand..."
                  className={styles.input}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Lists: Key Features, Benefits, Care, How to Use, Spiritual Significance */}
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionHeading}>Features, Benefits &amp; Guidance (One per line)</h3>
          <div className={styles.grid2}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Key Features</label>
              <textarea
                rows={4}
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
                className={styles.textarea}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Benefits</label>
              <textarea
                rows={4}
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className={styles.textarea}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Care Instructions</label>
              <textarea
                rows={3}
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                className={styles.textarea}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>How to Use</label>
              <textarea
                rows={3}
                value={howToUse}
                onChange={(e) => setHowToUse(e.target.value)}
                className={styles.textarea}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Spiritual Significance</label>
              <textarea
                rows={3}
                value={spiritualSignificance}
                onChange={(e) => setSpiritualSignificance(e.target.value)}
                className={styles.textarea}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Trust Badges</label>
              <textarea
                rows={3}
                value={trustBadges}
                onChange={(e) => setTrustBadges(e.target.value)}
                className={styles.textarea}
              />
            </div>
          </div>
        </div>

        {/* 6. Specifications & FAQs */}
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionHeading}>Specifications &amp; FAQs</h3>
          <div className={styles.grid3} style={{ marginBottom: '1rem' }}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Material</label>
              <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Bead Type</label>
              <input type="text" value={beadType} onChange={(e) => setBeadType(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Size</label>
              <input type="text" value={size} onChange={(e) => setSize(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Weight</label>
              <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Origin</label>
              <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className={styles.input} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} style={{ marginBottom: '0.35rem' }}>
              Frequently Asked Questions
            </label>

            <div className={styles.faqList}>
              <div className={styles.faqHeaderRow}>
                <span>Question</span>
                <span>Answer</span>
                <span></span>
              </div>

              {faqList.map((faq, idx) => (
                <div key={idx} className={styles.faqRow}>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFaqList((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, question: val } : item))
                      );
                    }}
                    placeholder={`Question ${idx + 1}`}
                    className={styles.input}
                  />
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFaqList((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, answer: val } : item))
                      );
                    }}
                    placeholder="Enter answer..."
                    className={styles.textarea}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFaqList((prev) =>
                        prev.length > 1 ? prev.filter((_, i) => i !== idx) : [{ question: '', answer: '' }]
                      )
                    }
                    className={`${styles.iconActionBtn} ${styles.deleteActionBtn}`}
                    title="Remove FAQ"
                    style={{ height: '38px', width: '38px' }}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setFaqList((prev) => [...prev, { question: '', answer: '' }])}
                className={styles.addFaqBtn}
              >
                <AddCircleOutlineOutlinedIcon fontSize="small" />
                <span>Add FAQ Question</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footerActions}>
          <button type="button" onClick={onCancel} className={styles.backBtn}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={styles.submitBtn}>
            <SaveOutlinedIcon fontSize="small" />
            <span>{submitting ? 'Saving to Neon DB...' : isEdit ? 'Update Product' : 'Save Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
