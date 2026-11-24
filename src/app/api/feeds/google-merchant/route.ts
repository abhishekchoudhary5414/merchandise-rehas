import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SITE_URL, SITE_NAME } from '@/lib/seo-helpers';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { indexable: true },
      include: {
        category: true,
        images: true,
      },
    });

    const feedItems = products
      .map((p) => {
        const additionalImagesXml = p.images
          .map((img) => `<g:additional_image_link>${escapeXml(img.url)}</g:additional_image_link>`)
          .join('\n      ');

        const availability = p.inStock && p.stockQuantity > 0 ? 'in_stock' : 'out_of_stock';
        const gtinTag = p.barcode ? `<g:gtin>${escapeXml(p.barcode)}</g:gtin>` : '';
        const mpnTag = p.mpn ? `<g:mpn>${escapeXml(p.mpn)}</g:mpn>` : '';

        return `
    <item>
      <g:id>${escapeXml(p.sku || p.id)}</g:id>
      <g:title>${escapeXml(p.seoTitle || p.name)}</g:title>
      <g:description>${escapeXml(p.seoDescription || p.shortDescription || p.description)}</g:description>
      <g:link>${escapeXml(`${SITE_URL}/product/${p.slug}`)}</g:link>
      <g:image_link>${escapeXml(p.primaryImage)}</g:image_link>
      ${additionalImagesXml}
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${p.price.toFixed(2)} INR</g:price>
      <g:brand>${escapeXml(SITE_NAME)}</g:brand>
      ${gtinTag}
      ${mpnTag}
      <g:google_product_category>Apparel &amp; Accessories &gt; Jewelry &gt; Bracelets</g:google_product_category>
      <g:product_type>${escapeXml(p.category.name || 'Astrology Bracelets')}</g:product_type>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Express Indian Delivery</g:service>
        <g:price>${p.price >= 999 ? '0.00' : '79.00'} INR</g:price>
      </g:shipping>
    </item>`;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Sacred Astrology & Healing Crystal Bracelets</description>
    ${feedItems}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Merchant feed generation error:', error);
    return new NextResponse('Error generating feed', { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
