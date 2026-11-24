'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('orderNumber') || '';
  const [orderQuery, setOrderQuery] = useState(initialOrder);
  const [trackingData, setTrackingData] = useState<{
    orderNumber: string;
    courier: string;
    trackingId: string;
    status: string;
    estimatedDelivery: string;
  } | null>(initialOrder ? {
    orderNumber: initialOrder,
    courier: 'Shiprocket Express',
    trackingId: 'IND849204918',
    status: 'In Transit',
    estimatedDelivery: 'Nov 27, 2026',
  } : null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setTrackingData({
      orderNumber: orderQuery.trim(),
      courier: 'Shiprocket Air Express',
      trackingId: `IND${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: 'Shipped - In Transit',
      estimatedDelivery: '3 - 4 Business Days',
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>

      <h1 className="text-3xl font-serif font-bold text-amber-950 mb-2">
        Track Your Indian Delivery
      </h1>
      <p className="text-sm text-stone-600 mb-8">
        Enter your Order Number or Indian Mobile Number to view live courier status with our shipping partners.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="e.g. AB-IN-104928 or 9876543210"
          value={orderQuery}
          onChange={(e) => setOrderQuery(e.target.value)}
          className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
        >
          <Search className="w-4 h-4" /> Track
        </button>
      </form>

      {trackingData && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-stone-100 pb-4 gap-2">
            <div>
              <div className="text-xs text-stone-400 font-mono">ORDER #{trackingData.orderNumber}</div>
              <div className="text-base font-bold text-stone-900 mt-0.5">{trackingData.courier}</div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold">
                {trackingData.status}
              </span>
              <div className="text-xs text-stone-500 mt-1">Expected: {trackingData.estimatedDelivery}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4 text-xs">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="w-0.5 h-12 bg-emerald-500" />
              </div>
              <div>
                <div className="font-semibold text-stone-900">Order Confirmed & Processed</div>
                <div className="text-stone-500">Quality checked and packaged with authentic certificate</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div className="w-0.5 h-12 bg-amber-300" />
              </div>
              <div>
                <div className="font-semibold text-stone-900">Dispatched from Jaipur Hub</div>
                <div className="text-stone-500">Handed over to Shiprocket Express Courier · AWB: {trackingData.trackingId}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="font-semibold text-stone-500">Out for Doorstep Delivery</div>
                <div className="text-stone-400">Arriving at your local Indian delivery branch</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800">
      <Suspense fallback={<div className="p-12 text-center text-stone-500">Loading tracking portal...</div>}>
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
