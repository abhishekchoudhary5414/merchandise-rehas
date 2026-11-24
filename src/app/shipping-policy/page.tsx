import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck, ShieldCheck, HelpCircle } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-950 mb-2">
            Shipping & Indian GST Policy
          </h1>
          <p className="text-sm text-stone-600">
            Transparent delivery timelines, rates, and tax breakdown across all Indian States and Union Territories.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-800" /> 1. Delivery Coverage & Timelines
            </h2>
            <p>
              We deliver to over 19,000+ PIN codes across all 28 states and 8 union territories of India through trusted logistics partners like Shiprocket, Bluedart, and Delhivery.
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 pl-2">
              <li>Metro cities (Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad): 2 - 3 business days.</li>
              <li>Rest of India & Tier 2/3 towns: 3 - 5 business days.</li>
              <li>North-East, J&amp;K, and remote postal zones: 5 - 7 business days.</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-stone-100 pt-4">
            <h2 className="text-base font-bold text-amber-950">2. Shipping Charges</h2>
            <p>
              • <strong>Free Shipping:</strong> On all orders above ₹999.<br />
              • <strong>Standard Flat Rate:</strong> ₹79 for orders under ₹999.<br />
              • <strong>100% Secured Online Payments:</strong> Instant verification via UPI, Cards, and NetBanking with zero transaction charges.
            </p>
          </section>

          <section className="space-y-2 border-t border-stone-100 pt-4">
            <h2 className="text-base font-bold text-amber-950">3. GST & Tax Transparency</h2>
            <p>
              In accordance with Indian tax laws, all prices displayed on our platform are MRP (Maximum Retail Price), inclusive of applicable Goods and Services Tax (18% GST). A formal tax invoice featuring our GSTIN is automatically generated and dispatched with each order.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
