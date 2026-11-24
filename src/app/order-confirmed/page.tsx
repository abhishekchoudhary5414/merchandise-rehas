'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Truck } from 'lucide-react';

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'AB-IN-104928';
  const isCod = searchParams.get('cod') === 'true';

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold mb-3">
        {isCod ? 'Order Placed (Cash on Delivery)' : 'Payment Verified (Razorpay)'}
      </div>

      <h1 className="text-3xl font-serif font-bold text-amber-950 mb-3">
        Thank You for Your Order!
      </h1>

      <p className="text-stone-600 text-sm mb-6">
        Your order <strong>#{orderNumber}</strong> has been successfully placed. We have dispatched an SMS and email notification with your tracking details.
      </p>

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-left text-xs space-y-3 mb-8">
        <div className="flex items-center gap-2 font-semibold text-stone-900 text-sm">
          <Truck className="w-4 h-4 text-amber-800" /> Dispatch & Delivery Status
        </div>
        <p className="text-stone-600">
          Your handcrafted bracelet will be dispatched from our Jaipur atelier via <strong>Shiprocket Express</strong>. Delivery is expected within 3-5 business days across India.
        </p>
        <div className="pt-2 border-t border-stone-100 flex justify-between text-stone-500">
          <span>Tracking ID:</span>
          <span className="font-mono text-stone-900 font-semibold">IND{Math.floor(100000000 + Math.random() * 900000000)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href={`/track-order?orderNumber=${orderNumber}`}
          className="px-6 py-3 bg-amber-900 hover:bg-amber-950 text-white font-medium rounded-xl text-sm transition"
        >
          Track Courier Status
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium rounded-xl text-sm transition inline-flex items-center gap-1.5"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800">
      <Suspense fallback={<div className="p-12 text-center text-stone-500 text-sm">Loading confirmation...</div>}>
        <OrderConfirmedContent />
      </Suspense>
    </div>
  );
}
