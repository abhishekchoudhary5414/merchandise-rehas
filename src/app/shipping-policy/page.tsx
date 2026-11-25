import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Rates | REHAS Sacred Merchandise',
  description: 'Pan-India shipping rates, express delivery timelines, 19000+ PIN codes coverage, and GST tax invoice policy for consecrated crystal bracelets.',
};

export default function ShippingPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen bg-[#FDFBF7] text-stone-800 py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <BreadcrumbNav
            items={[
              { label: 'Home', href: '/' },
              { label: 'Shipping Policy', href: '/shipping-policy' },
            ]}
          />

          <div className="border-b border-stone-200 pb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#560067] bg-[#FAF2FC] px-3 py-1 rounded-full mb-3">
              <LocalShippingOutlinedIcon style={{ fontSize: 16 }} /> Pan-India Express Logistics
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#560067] tracking-tight mb-2">
              Shipping &amp; Delivery Policy
            </h1>
            <p className="text-sm md:text-base text-stone-600">
              Reliable doorstep dispatch directly from our sanctum in Patna, Bihar across 19,000+ Indian PIN codes.
            </p>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-2xl border border-stone-200 shadow-sm space-y-8 text-sm md:text-base text-stone-700 leading-relaxed">
            {/* Delivery Coverage */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <LocationOnOutlinedIcon className="text-[#560067]" /> 1. Pan-India Delivery Coverage &amp; Estimated Timelines
              </h2>
              <p>
                We service all 28 States and 8 Union Territories in partnership with premier courier networks including Shiprocket, Bluedart, Delhivery, and Xpressbees.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-[#FAF2FC] p-4 rounded-xl border border-[rgba(86,0,103,0.1)]">
                  <h3 className="font-bold text-[#560067] mb-1">Metro Cities</h3>
                  <p className="text-xs text-stone-600">Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune</p>
                  <span className="block mt-2 font-bold text-[#560067] text-sm">2 - 3 Business Days</span>
                </div>
                <div className="bg-[#FAF2FC] p-4 rounded-xl border border-[rgba(86,0,103,0.1)]">
                  <h3 className="font-bold text-[#560067] mb-1">Tier-2 &amp; Tier-3 Cities</h3>
                  <p className="text-xs text-stone-600">State capitals, industrial zones, and prominent district headquarters</p>
                  <span className="block mt-2 font-bold text-[#560067] text-sm">3 - 5 Business Days</span>
                </div>
                <div className="bg-[#FAF2FC] p-4 rounded-xl border border-[rgba(86,0,103,0.1)]">
                  <h3 className="font-bold text-[#560067] mb-1">North-East &amp; Remote</h3>
                  <p className="text-xs text-stone-600">Assam, Meghalaya, J&amp;K, Himachal, Andaman and special postal regions</p>
                  <span className="block mt-2 font-bold text-[#560067] text-sm">5 - 7 Business Days</span>
                </div>
              </div>
            </section>

            {/* Rates & Free Shipping */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <CheckCircleOutlinedIcon className="text-[#560067]" /> 2. Transparent Shipping Rates
              </h2>
              <ul className="list-disc list-inside space-y-2 pl-2 text-stone-600">
                <li><strong>FREE Shipping:</strong> Automatically applied at checkout on all orders of <strong>₹999 or more</strong>.</li>
                <li><strong>Standard Flat Rate:</strong> Nominal flat fee of <strong>₹79</strong> for orders below ₹999.</li>
                <li><strong>Cash on Delivery (COD):</strong> Available on eligible PIN codes with a small handling fee of ₹49.</li>
              </ul>
            </section>

            {/* Tax & Invoicing */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <ReceiptLongOutlinedIcon className="text-[#560067]" /> 3. GST Tax Invoice &amp; Packaging
              </h2>
              <p>
                All prices shown across the store are MRP inclusive of 18% Goods and Services Tax (GST). A full tax invoice featuring our registered GSTIN is issued electronically and physically packaged with every sanctified order.
              </p>
              <p className="text-stone-600">
                Every bracelet is cushioned in sacred protective velvet pouches and sturdy, tamper-evident outer boxes to ensure zero transit shock.
              </p>
            </section>

            {/* Courier Tracking */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <SupportAgentOutlinedIcon className="text-[#560067]" /> 4. Real-Time Order Tracking &amp; Help
              </h2>
              <p>
                Once handed over to the courier partner, an automated SMS and WhatsApp alert with your AWB tracking link is dispatched to your registered mobile number. You can also monitor your live consignment on our <Link href="/track-order" className="text-[#560067] font-bold underline">Order Tracking Page</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}
