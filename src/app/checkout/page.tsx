'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle,
  CreditCard,
  Banknote,
  Tag,
  AlertCircle
} from 'lucide-react';
import {
  INDIAN_STATES_AND_UTS,
  formatINR,
  isValidIndianMobile,
  isValidIndianPinCode,
  calculateShippingAndTax
} from '@/lib/india-localization';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  primaryImage: string;
  sku: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const initialQty = parseInt(searchParams.get('quantity') || '1', 10);
  const initialPin = searchParams.get('pinCode') || '';

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [quantity, setQuantity] = useState(initialQty);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Address & Customer Info (Requirement 8)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [flatBuilding, setFlatBuilding] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState<string>(INDIAN_STATES_AND_UTS[8]); // Default Delhi
  const [pinCode, setPinCode] = useState(initialPin);

  // Payment Selection (Requirement 1 & 6)
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetch(`/api/admin/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            setProduct(data.product);
          }
        })
        .catch(console.error);
    }
  }, [productId]);

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === 'AURA10') {
      const sub = (product ? product.price : 1499) * quantity;
      setDiscount(Math.round(sub * 0.1));
      setCouponApplied(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Invalid discount coupon. Try AURA10 for 10% off.');
    }
  }

  const basePrice = product ? product.price : 1499;
  const rawSubtotal = basePrice * quantity;
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discount);

  const calc = calculateShippingAndTax({
    subtotal: subtotalAfterDiscount,
    paymentMethod,
    flatRate: 79,
    freeShippingThreshold: 999,
    codFee: 49,
  });

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email || !phone) {
      setErrorMsg('Please provide full name, email, and Indian mobile number.');
      return;
    }

    if (!isValidIndianMobile(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (+91).');
      return;
    }

    if (!isValidIndianPinCode(pinCode)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!flatBuilding || !streetArea || !city || !state) {
      setErrorMsg('Please enter complete delivery address details.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order on server side
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          flatBuilding,
          streetArea,
          landmark,
          city,
          state,
          pinCode,
          paymentMethod,
          couponCode: couponApplied ? 'AURA10' : null,
          items: [
            {
              productId: product?.id || 'sample-id',
              quantity,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order creation failed');
      }

      const order = data.order;

      // 2. Handle Razorpay Payment flow
      if (paymentMethod === 'RAZORPAY') {
        const razorpayKey = data.razorpay?.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        // Check if Razorpay script is loaded on window
        if (typeof window !== 'undefined' && (window as any).Razorpay && razorpayKey && data.razorpay?.orderId && !data.razorpay.orderId.startsWith('order_sim_')) {
          const options = {
            key: razorpayKey,
            amount: data.razorpay.amount,
            currency: 'INR',
            name: 'REHAS Sacred Merchandise',
            description: data.razorpay.description || 'Sacred Energy Bracelets',
            image: '/images/rehas-logo.png',
            order_id: data.razorpay.orderId,
            prefill: {
              name,
              email,
              contact: phone,
            },
            notes: {
              orderId: order.id,
              orderNumber: order.orderNumber,
            },
            theme: {
              color: '#560067',
            },
            handler: async function (response: any) {
              try {
                const verifyRes = await fetch('/api/orders/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: order.id,
                    razorpayOrderId: response.razorpay_order_id || data.razorpay.orderId,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                });

                if (!verifyRes.ok) {
                  const vData = await verifyRes.json();
                  throw new Error(vData.error || 'Payment signature verification failed');
                }

                router.push(`/order-confirmed?orderNumber=${order.orderNumber}`);
              } catch (verifyErr: any) {
                setErrorMsg(verifyErr.message || 'Payment verification failed');
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: function () {
                setIsSubmitting(false);
              },
            },
          };

          const rzpInstance = new (window as any).Razorpay(options);
          rzpInstance.on('payment.failed', function (failResp: any) {
            setErrorMsg(failResp.error?.description || 'Payment transaction failed. Please try again.');
            setIsSubmitting(false);
          });
          rzpInstance.open();
        } else {
          // Fallback if Razorpay checkout script is unavailable in current browser
          const simulatedPaymentId = `pay_sim_${Date.now()}`;
          const verifyRes = await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              razorpayOrderId: data.razorpay.orderId,
              razorpayPaymentId: simulatedPaymentId,
              razorpaySignature: 'simulated_valid_signature',
            }),
          });

          if (!verifyRes.ok) {
            const vData = await verifyRes.json();
            throw new Error(vData.error || 'Payment verification failed');
          }

          router.push(`/order-confirmed?orderNumber=${order.orderNumber}`);
        }
      } else {
        // COD order confirmed
        router.push(`/order-confirmed?orderNumber=${order.orderNumber}&cod=true`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while placing your order.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-stone-500 hover:text-stone-800 text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>
      </div>

      <h1 className="text-2xl lg:text-3xl font-serif font-bold text-amber-950 mb-8">
        Indian Express Checkout
      </h1>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Indian Shipping & Address Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-stone-900 border-b border-stone-100 pb-3">
              1. Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Indian Mobile Number (+91) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600">Email Address *</label>
              <input
                type="email"
                required
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Indian Address Details (Requirement 8) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-stone-900 border-b border-stone-100 pb-3">
              2. Indian Delivery Address
            </h2>
            <div>
              <label className="text-xs font-semibold text-stone-600">House / Flat / Building No. *</label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 402, Royal Palms Apartment"
                value={flatBuilding}
                onChange={(e) => setFlatBuilding(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600">Street / Area / Sector *</label>
              <input
                type="text"
                required
                placeholder="e.g. MG Road, Near Metro Station"
                value={streetArea}
                onChange={(e) => setStreetArea(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600">Landmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Opposite City Mall"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600">PIN Code (6 Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 110001"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">State / UT *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
                >
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selection (Requirement 1 & 6) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-stone-900 border-b border-stone-100 pb-3">
              3. Payment Method (India)
            </h2>
            <div className="space-y-3">
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-amber-700 bg-amber-50/50 ring-1 ring-amber-700'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="text-amber-800"
                  />
                  <div>
                    <div className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-800" />
                      Razorpay Online Payment (Recommended)
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, Netbanking & Wallets.
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Instant Dispatch
                </span>
              </label>

              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-amber-700 bg-amber-50/50 ring-1 ring-amber-700'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-amber-800"
                  />
                  <div>
                    <div className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-stone-600" />
                      Cash on Delivery (COD)
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Pay cash or QR code to the courier delivery partner upon doorstep arrival.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-stone-600">+₹49 Handling</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Indian Breakdown (Requirement 1 & 8) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-base font-semibold text-stone-900 border-b border-stone-100 pb-3">
              Order Summary
            </h2>

            {/* Product Snapshot */}
            <div className="flex items-center gap-4">
              <img
                src={product?.primaryImage || 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=400&q=80'}
                alt={product?.name || 'Selected Bracelet'}
                className="w-16 h-16 rounded-xl object-cover bg-stone-100 border border-stone-200"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-stone-900 truncate">
                  {product?.name || 'Kundan Heritage Royal Bracelet'}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Qty: {quantity} · SKU: {product?.sku || 'AB-KUN-01'}
                </div>
                <div className="text-xs font-bold text-amber-900 mt-1">
                  {formatINR(basePrice * quantity)}
                </div>
              </div>
            </div>

            {/* Discount Coupon Code */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-stone-600">Promotional Coupon</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="e.g. AURA10"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  disabled={couponApplied}
                  className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg text-xs uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponApplied}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {couponApplied && (
                <div className="text-xs text-emerald-700 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 10% coupon discount applied!
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-4 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal (MRP):</span>
                <span>{formatINR(rawSubtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span>
                  {calc.shippingFee === 0 ? (
                    <strong className="text-emerald-700 uppercase">FREE</strong>
                  ) : (
                    formatINR(calc.shippingFee)
                  )}
                </span>
              </div>

              {paymentMethod === 'COD' && (
                <div className="flex justify-between text-stone-700">
                  <span>COD Handling Fee:</span>
                  <span>{formatINR(calc.codFee)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-500">
                <span>Estimated GST Included (18%):</span>
                <span>{formatINR(calc.taxAmount)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-amber-950 pt-3 border-t border-stone-200">
                <span>Final Payable Amount:</span>
                <span>{formatINR(calc.total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
            >
              {isSubmitting
                ? 'Processing Securely...'
                : paymentMethod === 'RAZORPAY'
                ? `Pay with Razorpay (${formatINR(calc.total)})`
                : `Confirm Order with Cash on Delivery`}
            </button>

            <div className="pt-2 text-[11px] text-stone-500 text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit SSL encrypted secure Indian checkout</span>
              </div>
              <div>Estimated Delivery: 3 - 5 business days across India</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800">
      <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500">Loading checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
