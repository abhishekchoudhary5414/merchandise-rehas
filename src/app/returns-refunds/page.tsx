import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

export const metadata: Metadata = {
  title: '7-Day Doorstep Returns & Refunds | REHAS Sacred Merchandise',
  description: 'Learn about our 7-day doorstep replacement window, transit damage coverage, and Razorpay instant refund timelines.',
};

export default function ReturnsRefundsPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen bg-[#FDFBF7] text-stone-800 py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <BreadcrumbNav
            items={[
              { label: 'Home', href: '/' },
              { label: 'Returns & Refunds', href: '/returns-refunds' },
            ]}
          />

          <div className="border-b border-stone-200 pb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#560067] bg-[#FAF2FC] px-3 py-1 rounded-full mb-3">
              <AssignmentReturnOutlinedIcon style={{ fontSize: 16 }} /> Patron Satisfaction Pledge
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#560067] tracking-tight mb-2">
              7-Day Doorstep Returns &amp; Refund Policy
            </h1>
            <p className="text-sm md:text-base text-stone-600">
              Clear, transparent guidelines on transit replacements, spiritual consecration sanctity, and Razorpay refunds.
            </p>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-2xl border border-stone-200 shadow-sm space-y-8 text-sm md:text-base text-stone-700 leading-relaxed">
            {/* 1. Return Window */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <CheckCircleOutlinedIcon className="text-[#560067]" /> 1. 7-Day Doorstep Replacement Guarantee
              </h2>
              <p>
                We inspect every energized bracelet with utmost reverence before dispatch. If your package arrives damaged in courier transit, exhibits an incorrect size, or differs from your ordered crystal, you are entitled to a <strong>free doorstep pickup and replacement</strong> within <strong>7 days of delivery</strong>.
              </p>
            </section>

            {/* 2. Process */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <AutorenewOutlinedIcon className="text-[#560067]" /> 2. Easy 3-Step Replacement Process
              </h2>
              <ol className="list-decimal list-inside space-y-2 pl-2 text-stone-600">
                <li><strong>Share Details:</strong> WhatsApp our support team at <strong>+91 9517973153</strong> or email <strong>merchandise.rehas@gmail.com</strong> with your Order ID and photo of the parcel.</li>
                <li><strong>Doorstep Pickup:</strong> Our logistics partner will arrange a reverse pickup from your address within 24–48 hours.</li>
                <li><strong>Sanctified Reshipment:</strong> A freshly consecrated replacement is dispatched immediately upon pickup confirmation.</li>
              </ol>
            </section>

            {/* 3. Refund Timelines */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <AccountBalanceWalletOutlinedIcon className="text-[#560067]" /> 3. Refund Timelines via Razorpay
              </h2>
              <p>
                In cases where an exact replacement is unavailable, an immediate full refund is initiated:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-600">
                <li><strong>UPI &amp; NetBanking:</strong> Refunded directly to your bank account within 2 to 4 business days.</li>
                <li><strong>Credit / Debit Cards:</strong> Credited back to the originating bank card within 3 to 5 business days.</li>
                <li><strong>Cash on Delivery (COD):</strong> Refunded to your provided Indian Bank Account or verified UPI ID within 24 hours of return receipt.</li>
              </ul>
            </section>

            {/* 4. Contact */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <HelpOutlineOutlinedIcon className="text-[#560067]" /> 4. Customer Support Helpline
              </h2>
              <div className="bg-[#FAF2FC] p-4 rounded-xl border border-[rgba(86,0,103,0.12)] text-stone-800 space-y-1">
                <p><strong>Returns Desk:</strong> REHAS Consecration Center</p>
                <p><strong>Address:</strong> REHAS, Chanakya Nagar Road, Agam Kua, Patna, Bihar, India - 800007</p>
                <p><strong>Patron Support WhatsApp:</strong> +91 9517973153 (24 Hours Daily)</p>
                <p><strong>Email:</strong> merchandise.rehas@gmail.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}
