import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import siteConfig from '@/data/site-config.json';

export async function GET() {
  try {
    // 1. Fetch images used across products and categories in Neon DB
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          primaryImage: true,
          images: true,
          createdAt: true,
        },
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          driveFileId: true,
        },
      }),
    ]);

    // Aggregate catalog files
    const mediaFiles: any[] = [];
    let estimatedBytes = 0;

    products.forEach((p) => {
      if (p.primaryImage) {
        mediaFiles.push({
          id: `prod-pri-${p.id}`,
          name: `${p.name} - Primary Photo`,
          itemType: 'Product Image',
          productSku: p.sku,
          url: p.primaryImage,
          sizeKb: 285, // estimated avg compressed webp/jpg
          uploadedAt: p.createdAt,
        });
        estimatedBytes += 285 * 1024;
      }
      if (Array.isArray(p.images)) {
        p.images.forEach((imgItem: any, idx: number) => {
          const imgUrl = typeof imgItem === 'string' ? imgItem : imgItem?.url;
          if (imgUrl && imgUrl !== p.primaryImage) {
            mediaFiles.push({
              id: `prod-gal-${p.id}-${idx}`,
              name: `${p.name} - Gallery Image ${idx + 1}`,
              itemType: 'Gallery Image',
              productSku: p.sku,
              url: imgUrl,
              sizeKb: 340,
              uploadedAt: p.createdAt,
            });
            estimatedBytes += 340 * 1024;
          }
        });
      }
    });

    categories.forEach((c) => {
      if (c.imageUrl) {
        mediaFiles.push({
          id: `cat-${c.id}`,
          name: `${c.name} - Category Banner`,
          itemType: 'Category Asset',
          productSku: c.slug,
          url: c.imageUrl,
          sizeKb: 410,
          uploadedAt: new Date(),
        });
        estimatedBytes += 410 * 1024;
      }
    });

    // 2. Try fetching live Google Drive storage quota if credentials & network allow
    let totalStorageBytes = 15 * 1024 * 1024 * 1024; // Default Google Drive Free 15 GB
    let usedStorageBytes = estimatedBytes;
    let driveEmail = siteConfig.contact.email;
    let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1ZI4__1WdzC5NvbTN0mfdeH2WOtX-VXLR';
    let isConnected = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN);

    try {
      if (isConnected) {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          'https://developers.google.com/oauthplayground'
        );
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const aboutRes = await drive.about.get({ fields: 'storageQuota, user' });
        if (aboutRes.data.storageQuota) {
          const quota = aboutRes.data.storageQuota;
          if (quota.limit) totalStorageBytes = parseInt(quota.limit, 10);
          if (quota.usage) usedStorageBytes = parseInt(quota.usage, 10);
        }
        if (aboutRes.data.user?.emailAddress) {
          driveEmail = aboutRes.data.user.emailAddress;
        }
      }
    } catch {
      // Use Neon DB calculated storage metrics gracefully if outbound token fetch is blocked or timed out
    }

    const availableStorageBytes = Math.max(0, totalStorageBytes - usedStorageBytes);
    const usagePercentage = Math.min(100, Math.round((usedStorageBytes / totalStorageBytes) * 1000) / 10);

    return NextResponse.json({
      folderId,
      driveEmail,
      isConnected,
      storage: {
        totalBytes: totalStorageBytes,
        usedBytes: usedStorageBytes,
        availableBytes: availableStorageBytes,
        usagePercentage,
        totalGb: (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(1),
        usedMb: (usedStorageBytes / (1024 * 1024)).toFixed(1),
        usedGb: (usedStorageBytes / (1024 * 1024 * 1024)).toFixed(2),
        availableGb: (availableStorageBytes / (1024 * 1024 * 1024)).toFixed(1),
      },
      files: mediaFiles,
    });
  } catch (error: any) {
    console.error('Drive storage fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
