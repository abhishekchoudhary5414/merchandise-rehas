import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';

export const metadata: Metadata = {
  title: 'Terms & Conditions | REHAS Sacred Merchandise',
  description: 'Patron terms and conditions for ordering consecrated Vedic crystal bracelets, energization rituals, delivery timelines, and jurisdictional governance.',
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen bg-[#FDFBF7] text-stone-800 py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <BreadcrumbNav
            items={[
              { label: 'Home', href: '/' },
              { label: 'Terms & Conditions', href: '/terms-and-conditions' },
            ]}
          />

          <div className="border-b border-stone-200 pb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#560067] bg-[#FAF2FC] px-3 py-1 rounded-full mb-3">
              <GavelOutlinedIcon style={{ fontSize: 16 }} /> Legal &amp; Spiritual Agreement
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#560067] tracking-tight mb-2">
              Terms &amp; Sacred Conditions
            </h1>
            <p className="text-sm md:text-base text-stone-600">
              Effective Date: November 2026 • Governed by the laws of India and the jurisdiction of Patna Courts, Bihar.
            </p>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-2xl border border-stone-200 shadow-sm space-y-8 text-sm md:text-base text-stone-700 leading-relaxed">
            {/* 1. Introduction */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <PolicyOutlinedIcon className="text-[#560067]" /> 1. Agreement to Terms
              </h2>
              <p>
                By visiting, browsing, or purchasing consecrated merchandise from <strong>REHAS</strong> (hereinafter referred to as &ldquo;REHAS&rdquo;, &ldquo;we&rdquo;, or &ldquo;our&rdquo;), you agree to be bound by these Terms and Conditions, our Privacy Policy, and our 7-Day Doorstep Replacement Guidelines.
              </p>
            </section>

            {/* 2. Nature of Sacred Consecration */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <AutoAwesomeOutlinedIcon className="text-[#560067]" /> 2. Nature of Vedic Consecration &amp; Crystals
              </h2>
              <p>
                • <strong>Natural Mineral Inclusions:</strong> Every crystal bracelet is assembled using 100% genuine earth-mined stones (Pyrite, Sulemani Hakik, Citrine, Tiger Eye, etc.). Natural inclusions, slight color shifts, and minor bead variations are inherent signs of genuine natural formation and are not considered manufacturing defects.
              </p>
              <p>
                • <strong>Spiritual Energization (Prana Pratishtha):</strong> Items undergo purification with holy Ganga Jal and planetary mantra activation in our Patna sanctum. While based on classical Vedic traditions, crystal energy and astrological remedies are spiritual aids and should not substitute for licensed medical, psychological, financial, or legal advice.
              </p>
            </section>

            {/* 3. Pricing & Indian Taxes */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <VerifiedUserOutlinedIcon className="text-[#560067]" /> 3. Pricing &amp; GST Compliance
              </h2>
              <p>
                All prices are stated in Indian Rupees (INR, ₹). In compliance with Indian tax statutes, prices shown are MRP inclusive of 18% Goods and Services Tax (GST). Delivery charges are complimentary on orders above ₹999 across all Indian PIN codes.
              </p>
            </section>

            {/* 4. Delivery & Pan-India Dispatch */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <LocalShippingOutlinedIcon className="text-[#560067]" /> 4. Shipping &amp; Doorstep Delivery
              </h2>
              <p>
                Orders are ritually consecrated and dispatched within 24 to 48 business hours from our sanctum in Patna, Bihar. Consignments are handled by premier logistics carriers (Shiprocket, Bluedart, Delhivery). Delivery typically arrives within 2–5 business days depending on destination PIN code.
              </p>
            </section>

            {/* 5. Returns & Spiritual Sanctity */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <AssignmentReturnOutlinedIcon className="text-[#560067]" /> 5. Returns &amp; Damage Claim Policy
              </h2>
              <p>
                We offer a hassle-free 7-day doorstep replacement window for any piece that arrives damaged, defective, or incorrect during postal transit. To ensure spiritual sanctity, items must be in their original packaging. Please share parcel photographs with our helpline at <strong>+91 9517973153</strong> or <strong>merchandise.rehas@gmail.com</strong> within 48 hours of delivery.
              </p>
            </section>

            {/* 6. Jurisdiction */}
            <section className="space-y-3 border-t border-stone-100 pt-6">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#560067] flex items-center gap-2">
                <GavelOutlinedIcon className="text-[#560067]" /> 6. Governing Law &amp; Jurisdiction
              </h2>
              <p>
                These Terms shall be interpreted and enforced strictly in accordance with the laws of the Republic of India. In the event of any legal dispute, courts situated exclusively in <strong>Patna, Bihar, India</strong> shall have sole jurisdiction.
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
