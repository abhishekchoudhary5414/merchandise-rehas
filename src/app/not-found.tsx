import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="font-serif text-7xl font-bold text-amber-950">404</div>
        <h1 className="text-2xl font-serif font-semibold text-stone-900">
          Bracelet Not Found
        </h1>
        <p className="text-stone-600 text-sm">
          The page or product design you are looking for might have been moved or is no longer available in our collection.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-900 text-white font-medium hover:bg-amber-950 transition text-sm shadow"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
