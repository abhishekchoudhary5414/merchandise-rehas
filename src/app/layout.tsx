import type { Metadata } from 'next';
import Script from 'next/script';
import StoreSync from '@/components/common/StoreSync';
import { SITE_NAME, SITE_URL } from '@/lib/seo-helpers';
import './globals.css';

const SITE_TITLE = 'REHAS Sacred Merchandise | Vedic Astrology & Crystal Energy Bracelets';
const SITE_DESCRIPTION =
  'Consecrated natural crystal bracelets tuned to your Kundli, Mulank, and Chakras. Free express doorstep delivery across India with 100% secured payments.';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return (
    <html lang="en-IN">
      <head>
        {googleVerification && (
          <meta name="google-site-verification" content={googleVerification} />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body>
        <StoreSync />
        {children}
      </body>
    </html>
  );
}
