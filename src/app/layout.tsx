import type { Metadata } from 'next';
import Script from 'next/script';
import StoreSync from '@/components/common/StoreSync';
import './globals.css';

export const metadata: Metadata = {
  title: 'REHAS Sacred Merchandise | Vedic Astrology & Crystal Energy Bracelets',
  description: 'Consecrated natural crystal bracelets tuned to your Kundli, Mulank, and Chakras. Free express doorstep delivery across India with 100% secured payments.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
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
