// Indian Localization Constants and Helpers

export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
] as const;

export type IndianState = (typeof INDIAN_STATES_AND_UTS)[number];

/**
 * Format currency in Indian Rupees (₹) with standard Indian numbering system (e.g. ₹1,499)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate standard 6-digit Indian PIN code (Postal Index Number)
 * First digit must be 1-9 (0 is invalid in Indian postal code systems)
 */
export function isValidIndianPinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

/**
 * Validate Indian 10-digit mobile number, optionally prefixed with +91 or 91
 */
export function isValidIndianMobile(mobile: string): boolean {
  const cleaned = mobile.replace(/[\s\-+]/g, '');
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned);
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(cleaned);
  }
  return false;
}

/**
 * Standardize Indian phone number to +91XXXXXXXXXX
 */
export function formatIndianMobile(mobile: string): string {
  const cleaned = mobile.replace(/[\s\-+]/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const raw = cleaned.slice(2);
    return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  }
  return mobile;
}

export interface ShippingCalculation {
  subtotal: number;
  shippingFee: number;
  codFee: number;
  taxAmount: number; // GST component included
  total: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  estimatedDeliveryDays: string;
}

/**
 * Calculate Indian shipping, free-shipping threshold, and GST breakdown
 */
export function calculateShippingAndTax({
  subtotal,
  paymentMethod,
  flatRate = 79,
  freeShippingThreshold = 999,
  codFee = 49,
  gstPercentage = 18,
}: {
  subtotal: number;
  paymentMethod: 'RAZORPAY' | 'COD';
  flatRate?: number;
  freeShippingThreshold?: number;
  codFee?: number;
  gstPercentage?: number;
}): ShippingCalculation {
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : flatRate;
  const applicableCodFee = paymentMethod === 'COD' ? codFee : 0;
  
  // Prices on e-commerce in India are MRP inclusive of GST
  // Tax breakdown: Subtotal / (1 + GST) * GST
  const taxablePortion = subtotal / (1 + gstPercentage / 100);
  const taxAmount = Math.round(subtotal - taxablePortion);

  const total = subtotal + shippingFee + applicableCodFee;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return {
    subtotal,
    shippingFee,
    codFee: applicableCodFee,
    taxAmount,
    total,
    isFreeShipping,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    estimatedDeliveryDays: '3 - 5 business days across India',
  };
}
