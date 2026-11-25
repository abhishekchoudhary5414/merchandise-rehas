import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

export const metadata: Metadata = {
  title: 'Privacy & Sacred Protection Policy | REHAS Sacred Merchandise',
  description: 'Our sacred pledge to protect patron privacy, birth details, astrological charts, and payment security under the Digital Personal Data Protection (DPDP) Act of India.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen bg-[#FDFBF7] text-stone-800 py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <BreadcrumbNav
            items={[
              { label: 'Home', href: '/' },
              { label: 'Privacy & Sacred Policy', href: '/privacy-policy' },
            ]}
          />

          <div className="border-b border-stone-200 pb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#560067] bg-[#FAF2FC] px-3 py-1 rounded-full mb-3">
              <ShieldOutlinedIcon style={{ fontSize: 16 }} /> Patron Data Sanctity
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#560067] tracking-tight mb-2">
              Privacy &amp; Sacred Data Policy
            </h1>
            <p className="text-sm md:text-base text-stone-600">
              Last Updated: November 2026 • Compliant with the Information Technology Act (2000) and the Digital Personal Data Protection (DPDP) Act of India.
            </p>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-2xl border border-stone-200 shadow-sm space-y-8 text-sm md:text-base text-stone-700 leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <LockOutlinedIcon className="text-[#560067]" /> 1. Sacred Confidentiality of Astrological Details
              </h2>
              <p>
                At <strong>REHAS Sacred Merchandise</strong>, we treat your birth date, birth time, Gotra, birth rashi, and Mulank with the highest spiritual sanctity and confidentiality. Any astrological consultation data provided during energy consecration (<em>Prana Pratishtha</em>) is utilized exclusively by our Vedic Acharyas to perform authorized Beej Mantra energization rituals.
              </p>
              <p className="text-stone-600">
                Under no circumstances do we ever rent, license, commercialize, or share your spiritual birth records with third-party advertisers or data brokers.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <PersonOutlinedIcon className="text-[#560067]" /> 2. Personal Information Collected
              </h2>
              <p>We collect essential information required to fulfill your sacred order and courier delivery across India:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-600">
                <li><strong>Contact Credentials:</strong> Full name, verified Indian mobile phone number, and delivery email address.</li>
                <li><strong>Delivery Destination:</strong> Flat/house number, street/area, nearest landmark, city, state, and 6-digit PIN code.</li>
                <li><strong>Consecration Customization:</strong> Optional Gotra, birth planetary preferences, and personalized sankalpa intent.</li>
                <li><strong>Transactional Audit:</strong> Razorpay transaction IDs, payment status, and generated GSTIN tax invoices.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <ShieldOutlinedIcon className="text-[#560067]" /> 3. Payment Card &amp; Banking Security
              </h2>
              <p>
                We do not store, process, or view your credit card numbers, debit card PINs, CVV codes, or UPI MPINs. All monetary transactions are processed directly through <strong>Razorpay Payments</strong> utilizing bank-grade 256-Bit SSL encryption complying with RBI (Reserve Bank of India) regulations and PCI-DSS Level 1 certification.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <CookieOutlinedIcon className="text-[#560067]" /> 4. Cookies &amp; Local Storage
              </h2>
              <p>
                Our platform utilizes local storage and minimal session cookies solely to preserve your active shopping cart, sacred wishlist, authenticated customer session tokens, and postal PIN code verification for smooth doorstep delivery.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <HelpOutlineOutlinedIcon className="text-[#560067]" /> 5. Grievance Redressal &amp; Contact
              </h2>
              <p>
                For any data inquiries, erasure requests, or privacy questions, you may contact our designated Patron Grievance Officer:
              </p>
              <div className="bg-[#FAF2FC] p-4 rounded-xl border border-[rgba(86,0,103,0.12)] text-stone-800 space-y-1">
                <p><strong>Grievance Officer:</strong> REHAS Compliance Desk</p>
                <p><strong>Physical Sanctum:</strong> REHAS, Chanakya Nagar Road, Agam Kua, Patna, Bihar, India - 800007</p>
                <p><strong>Official Email:</strong> merchandise.rehas@gmail.com</p>
                <p><strong>Direct Helpline / WhatsApp:</strong> +91 9517973153 (Available 24 Hours Daily)</p>
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
