'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Share2,
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Save,
  ArrowLeft,
  Sliders,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { formatINR } from '@/lib/india-localization';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  barcode: string | null;
  mpn: string | null;
  category: string;
  material: string | null;
  stockQuantity: number;
  inStock: boolean;
  primaryImage: string;
  images: string;
  // SEO fields
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  indexable: boolean;
}

export default function AdminSeoProductEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'seo' | 'og' | 'twitter' | 'audit'>('seo');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aurabracelets.in';

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        setSelectedProductId(data.products[0].id);
        setFormData(data.products[0]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleSelectProduct(id: string) {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setFormData(prod);
    }
  }

  function updateField(field: keyof Product, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // Live Auto-generate SEO defaults from product data (Requirement 2 & 5)
  function handleGenerateDefaults() {
    if (!formData.name) return;
    const cleanSlug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const defaultTitle = `${formData.name} | Aura Handcrafted Indian Bracelets`;
    const defaultDesc =
      formData.shortDescription ||
      `Buy handcrafted ${formData.name} online in India. Authentic artisanal bracelet with free shipping above ₹999 & Cash on Delivery.`;

    const defaultCanonical = `${siteUrl}/product/${formData.slug || cleanSlug}`;
    const defaultImg = formData.primaryImage || 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=1200&h=630&q=80';

    setFormData((prev) => ({
      ...prev,
      slug: prev.slug || cleanSlug,
      seoTitle: prev.seoTitle || defaultTitle,
      seoDescription: prev.seoDescription || defaultDesc,
      canonicalUrl: prev.canonicalUrl || defaultCanonical,
      ogTitle: prev.ogTitle || defaultTitle,
      ogDescription: prev.ogDescription || defaultDesc,
      ogImage: prev.ogImage || defaultImg,
      twitterTitle: prev.twitterTitle || defaultTitle,
      twitterDescription: prev.twitterDescription || defaultDesc,
      twitterImage: prev.twitterImage || defaultImg,
    }));

    setNotification({
      type: 'success',
      message: 'Generated optimized SEO defaults from product details.',
    });
  }

  async function handleSave() {
    if (!selectedProductId) return;
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/admin/products/${selectedProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', message: 'SEO and Product settings saved successfully!' });
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProductId ? { ...p, ...formData } as Product : p))
        );
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to save changes.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error occurred.' });
    } finally {
      setSaving(false);
    }
  }

  // Character calculations & checks
  const titleLength = (formData.seoTitle || formData.name || '').length;
  const descLength = (formData.seoDescription || formData.shortDescription || '').length;

  const currentSlug = formData.slug || '';
  const currentOgTitle = formData.ogTitle || formData.seoTitle || formData.name || '';
  const currentOgDesc = formData.ogDescription || formData.seoDescription || formData.shortDescription || '';
  const currentOgImage = formData.ogImage || formData.primaryImage || 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=1200&h=630&q=80';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition flex items-center gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Storefront
            </Link>
            <div className="h-4 w-px bg-stone-300" />
            <h1 className="text-xl font-serif font-bold text-amber-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              Advanced Product SEO & Metadata Studio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
              title="Automatically generate appropriate SEO defaults from product name and description"
            >
              <RefreshCw className="w-4 h-4" /> Auto-Fill SEO Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product Selector & Core Product Details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Select Product to Edit SEO
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatINR(p.price)})
                  </option>
                ))}
              </select>

              {formData.primaryImage && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={formData.primaryImage}
                    alt={formData.name || 'Product'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-mono rounded">
                    SKU: {formData.sku}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 space-y-3">
                <div>
                  <label className="text-xs font-medium text-stone-500">Product Title</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-stone-500">Price (INR ₹)</label>
                    <input
                      type="number"
                      value={formData.price || 0}
                      onChange={(e) => updateField('price', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500">Stock Qty</label>
                    <input
                      type="number"
                      value={formData.stockQuantity || 0}
                      onChange={(e) => updateField('stockQuantity', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500">Short Description</label>
                  <textarea
                    rows={3}
                    value={formData.shortDescription || ''}
                    onChange={(e) => updateField('shortDescription', e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Quick Links & Sitemaps */}
            <div className="bg-amber-900/5 p-5 rounded-2xl border border-amber-900/10 space-y-3 text-xs text-stone-700">
              <h3 className="font-semibold text-amber-950 flex items-center gap-1.5 text-sm">
                <Globe className="w-4 h-4 text-amber-700" />
                Live SEO Integrations
              </h3>
              <p>Dynamic sitemaps and shopping feeds ready for submission:</p>
              <ul className="space-y-1.5 font-mono text-[11px] text-amber-900">
                <li>
                  <a href="/sitemap.xml" target="_blank" className="hover:underline">
                    ↗ /sitemap.xml (All Products & Pages)
                  </a>
                </li>
                <li>
                  <a href="/robots.txt" target="_blank" className="hover:underline">
                    ↗ /robots.txt (Index Directives)
                  </a>
                </li>
                <li>
                  <a href="/api/feeds/google-merchant" target="_blank" className="hover:underline">
                    ↗ /api/feeds/google-merchant (GMC Shopping Feed)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: SEO Configuration Tabs and Previews */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-stone-200 gap-2">
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition flex items-center gap-2 ${
                  activeTab === 'seo'
                    ? 'bg-white border-t border-l border-r border-stone-200 text-amber-900 -mb-px shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Search className="w-4 h-4" /> Google Search SEO
              </button>
              <button
                onClick={() => setActiveTab('og')}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition flex items-center gap-2 ${
                  activeTab === 'og'
                    ? 'bg-white border-t border-l border-r border-stone-200 text-amber-900 -mb-px shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Share2 className="w-4 h-4" /> Open Graph & WhatsApp
              </button>
              <button
                onClick={() => setActiveTab('twitter')}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition flex items-center gap-2 ${
                  activeTab === 'twitter'
                    ? 'bg-white border-t border-l border-r border-stone-200 text-amber-900 -mb-px shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Globe className="w-4 h-4" /> Twitter / X Card
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition flex items-center gap-2 ${
                  activeTab === 'audit'
                    ? 'bg-white border-t border-l border-r border-stone-200 text-amber-900 -mb-px shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Recommendations
              </button>
            </div>

            {/* Tab 1: Google Search SEO */}
            {activeTab === 'seo' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-stone-800">Product URL Slug</label>
                    <span className="text-xs text-stone-400">SEO-friendly canonical path</span>
                  </div>
                  <div className="mt-1 flex rounded-lg shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-stone-200 bg-stone-50 text-stone-500 text-xs font-mono">
                      {siteUrl}/product/
                    </span>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => updateField('slug', e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 border border-stone-200 rounded-r-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-stone-800">SEO Meta Title</label>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        titleLength >= 50 && titleLength <= 60
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {titleLength} / 60 characters (Optimal: 50-60)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.seoTitle || ''}
                    placeholder={formData.name ? `${formData.name} | Aura Bracelets India` : ''}
                    onChange={(e) => updateField('seoTitle', e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-stone-800">SEO Meta Description</label>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        descLength >= 140 && descLength <= 160
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {descLength} / 160 characters (Optimal: 140-160)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.seoDescription || ''}
                    placeholder="Short engaging meta description highlighting craft, INR pricing, and fast India delivery..."
                    onChange={(e) => updateField('seoDescription', e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-stone-800">Canonical URL</label>
                    <input
                      type="text"
                      value={formData.canonicalUrl || ''}
                      placeholder={`${siteUrl}/product/${formData.slug || ''}`}
                      onChange={(e) => updateField('canonicalUrl', e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-800">SEO Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      value={formData.seoKeywords || ''}
                      placeholder="kundan bracelet, 925 silver kada, indian jewelry"
                      onChange={(e) => updateField('seoKeywords', e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  <div>
                    <div className="text-sm font-semibold text-stone-800">Search Engine Indexing Control</div>
                    <div className="text-xs text-stone-500">
                      When disabled, outputs <code>noindex</code> to keep this product hidden from Google.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.indexable ?? true}
                      onChange={(e) => updateField('indexable', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-700"></div>
                  </label>
                </div>

                {/* Google Snippet Live Preview (Requirement 5.9) */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-stone-400" /> Google Search SERP Snippet Preview
                  </h4>
                  <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-sm space-y-1 max-w-xl">
                    <div className="text-xs text-stone-600 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-stone-200 inline-flex items-center justify-center text-[10px] font-bold">
                        A
                      </span>
                      <span>{siteUrl}</span>
                      <span className="text-stone-400">› product › {formData.slug || 'bracelet'}</span>
                    </div>
                    <div className="text-blue-800 hover:underline text-lg font-medium leading-snug cursor-pointer">
                      {formData.seoTitle || `${formData.name} | Aura Bracelets India`}
                    </div>
                    <div className="text-xs text-stone-600 line-clamp-2">
                      {formData.seoDescription ||
                        formData.shortDescription ||
                        'Discover handcrafted luxury bracelets for every occasion with fast delivery across India.'}
                    </div>
                    <div className="text-xs text-emerald-800 font-medium pt-1">
                      In Stock · {formatINR(formData.price || 0)} · Free Shipping Available
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Open Graph & Social Sharing (Requirement 2 & 5.10) */}
            {activeTab === 'og' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <label className="text-sm font-semibold text-stone-800">Open Graph Title</label>
                  <input
                    type="text"
                    value={formData.ogTitle || ''}
                    placeholder={formData.seoTitle || formData.name || ''}
                    onChange={(e) => updateField('ogTitle', e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-stone-800">Open Graph Description</label>
                  <textarea
                    rows={2}
                    value={formData.ogDescription || ''}
                    placeholder={formData.seoDescription || formData.shortDescription || ''}
                    onChange={(e) => updateField('ogDescription', e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-stone-800">
                    Open Graph Image URL (1200 × 630 px)
                  </label>
                  <p className="text-xs text-stone-500 mb-1">
                    Accessible to WhatsApp, Facebook, Instagram & iMessage previews.
                  </p>
                  <input
                    type="text"
                    value={formData.ogImage || ''}
                    placeholder={formData.primaryImage || 'https://...'}
                    onChange={(e) => updateField('ogImage', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-mono"
                  />
                </div>

                {/* Social Share Card Preview (Requirement 5.10) */}
                <div className="pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                    WhatsApp & Facebook Link Preview
                  </h4>
                  <div className="max-w-md border border-stone-300 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="aspect-[1.91/1] w-full bg-stone-100 overflow-hidden">
                      <img
                        src={currentOgImage}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 bg-stone-50 border-t border-stone-200">
                      <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                        {siteUrl.replace('https://', '')}
                      </div>
                      <div className="font-semibold text-stone-900 text-sm mt-0.5 line-clamp-1">
                        {currentOgTitle}
                      </div>
                      <div className="text-xs text-stone-600 line-clamp-2 mt-0.5">
                        {currentOgDesc}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Twitter / X Card */}
            {activeTab === 'twitter' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <label className="text-sm font-semibold text-stone-800">Twitter Card Title</label>
                  <input
                    type="text"
                    value={formData.twitterTitle || ''}
                    placeholder={formData.name || ''}
                    onChange={(e) => updateField('twitterTitle', e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-stone-800">Twitter Card Description</label>
                  <textarea
                    rows={2}
                    value={formData.twitterDescription || ''}
                    placeholder={formData.shortDescription || ''}
                    onChange={(e) => updateField('twitterDescription', e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-stone-800">Twitter Image URL</label>
                  <input
                    type="text"
                    value={formData.twitterImage || ''}
                    placeholder={formData.primaryImage || 'https://...'}
                    onChange={(e) => updateField('twitterImage', e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm font-mono"
                  />
                </div>

                {/* Twitter Large Image Card Preview */}
                <div className="pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                    X / Twitter Large Summary Card Preview
                  </h4>
                  <div className="max-w-md border border-stone-200 rounded-2xl overflow-hidden bg-black text-white shadow-sm">
                    <div className="aspect-[1.91/1] w-full bg-stone-900 overflow-hidden">
                      <img
                        src={formData.twitterImage || currentOgImage}
                        alt="Twitter Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-[11px] text-stone-400">aurabracelets.in</div>
                      <div className="font-semibold text-sm line-clamp-1">
                        {formData.twitterTitle || currentOgTitle}
                      </div>
                      <div className="text-xs text-stone-400 line-clamp-2 mt-0.5">
                        {formData.twitterDescription || currentOgDesc}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Recommendations & Auditing */}
            {activeTab === 'audit' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  SEO Recommendations & Quality Check
                </h3>
                <p className="text-xs text-stone-600">
                  Best-practice recommendations for high ranking in Indian e-commerce search results without misleading claims.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-stone-900">Include Indian Currency and Craft Keywords</h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Indian shoppers frequently search terms like "Kundan", "Temple Kada", "925 Silver", and "Cash on Delivery". Incorporate these in title and description.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-stone-900">Accurate Schema.org Structured Data</h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Prices are dynamically transmitted as <code>INR</code> in the Product schema with real stock status.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-stone-900">Social Open Graph Standards</h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Images must be publicly hosted at 1200x630 resolution so WhatsApp links and Instagram previews load crisply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
