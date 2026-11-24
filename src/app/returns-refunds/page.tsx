import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-950 mb-2">
            7-Day Returns & Refund Policy
          </h1>
          <p className="text-sm text-stone-600">
            Hassle-free doorstep pickup and swift refunds across India.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-800" /> 1. Return Window & Eligibility
            </h2>
            <p>
              We offer a 7-day return window from the date of delivery. If you are not completely satisfied with your handcrafted bracelet, or received a damaged/incorrect piece, you may request a free doorstep exchange or return.
            </p>
          </section>

          <section className="space-y-2 border-t border-stone-100 pt-4">
            <h2 className="text-base font-bold text-amber-950">2. Refund Processing via Razorpay</h2>
            <p>
              Once your returned item is received and inspected at our Jaipur warehouse:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 pl-2">
              <li>Prepaid Razorpay orders are refunded to the original payment source (UPI account, Credit/Debit Card) within 3-5 business days.</li>
              <li>COD orders are refunded directly to the customer's verified Indian bank account or UPI ID.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
