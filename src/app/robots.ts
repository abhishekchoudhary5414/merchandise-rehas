import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo-helpers';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/api/*',
          '/*?*sort=',
          '/*?*filter=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
