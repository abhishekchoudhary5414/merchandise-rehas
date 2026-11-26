import { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merchandise.rehas.in';
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'REHAS Sacred Merchandise';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function buildProductMetadata(product: any): Metadata {
  if (!product) {
    return {
      title: 'Sacred Bracelet Not Found | ' + SITE_NAME,
      description: 'The requested astrology healing crystal bracelet could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const productUrl = product.canonicalUrl || `${SITE_URL}/product/${product.slug}`;
  const ogImg = product.ogImage || product.primaryImage || DEFAULT_OG_IMAGE;
  const twImg = product.twitterImage || product.primaryImage || DEFAULT_OG_IMAGE;
  const pageTitle = product.seoTitle || `${product.name} | ${SITE_NAME}`;
  const pageDescription = product.seoDescription || product.shortDescription || product.description.slice(0, 160);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: product.seoKeywords ? product.seoKeywords.split(',').map((k: string) => k.trim()) : undefined,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: product.ogTitle || pageTitle,
      description: product.ogDescription || pageDescription,
      url: productUrl,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.twitterTitle || pageTitle,
      description: product.twitterDescription || pageDescription,
      images: [twImg],
    },
    robots: {
      index: product.indexable ?? true,
      follow: true,
    },
  };
}

export function generateProductJsonLd(product: any) {
  const imagesList = product.images && Array.isArray(product.images)
    ? product.images.map((img: any) => img.url)
    : [product.primaryImage];

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: imagesList.length > 0 ? imagesList : [product.primaryImage],
    description: product.shortDescription || product.description,
    sku: product.sku,
    mpn: product.mpn || undefined,
    gtin: product.barcode || undefined,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: product.category?.name || 'Astrology Bracelets',
    material: product.primaryCrystal || undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price.toString(),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock && product.stockQuantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };

  if (product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: ['https://www.instagram.com/rehas.in'],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9517973153',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  };
}
