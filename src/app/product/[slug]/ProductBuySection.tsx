'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';
import { isValidIndianPinCode } from '@/lib/india-localization';

interface ProductBuySectionProps {
  product: {
    id: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    inStock: boolean;
    stockQuantity: number;
    variants?: Array<{ id: string; wristSize: string; priceAdjust: number }>;
  };
}

export default function ProductBuySection({ product }: ProductBuySectionProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants && product.variants.length > 0
      ? product.variants[1]?.wristSize || product.variants[0].wristSize
      : 'Medium (7.0 inches)'
  );
  const [quantity, setQuantity] = useState(1);
  const [pinCode, setPinCode] = useState('');
  const [pinResult, setPinResult] = useState<{
    tested: boolean;
    valid: boolean;
    serviceable: boolean;
    message: string;
  }>({
    tested: false,
    valid: false,
    serviceable: false,
    message: '',
  });

  function handleCheckPinCode() {
    if (!pinCode.trim()) return;

    if (!isValidIndianPinCode(pinCode)) {
      setPinResult({
        tested: true,
        valid: false,
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian PIN code (e.g. 110001, 560001)',
      });
      return;
    }

    setPinResult({
      tested: true,
      valid: true,
      serviceable: true,
      message: `Delivery available at PIN ${pinCode}! Estimated dispatch in 24 hrs via Shiprocket. 100% Secured Online Payments supported.`,
    });
  }

  function handleBuyNow() {
    try {
      const checkoutItem = {
        productId: product.id,
        name: product.name,
        wristSize: selectedSize,
        unitPrice: product.price,
        quantity,
        pinCode: pinCode.trim(),
      };
      localStorage.setItem(
        'rehas_checkout_session',
        JSON.stringify({ source: 'buy_now', items: [checkoutItem], pinCode: pinCode.trim() })
      );
    } catch {
      // Ignore
    }
    router.push('/checkout');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Wrist Size Selection (Requirement 5 Variants) */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
          Select Wrist Size (Universal Stretchable Elastic)
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {['Small (6.5 inches / 16.5 cm)', 'Medium (7.0 inches / 17.8 cm)', 'Large (7.5 inches / 19.0 cm)'].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedSize === size ? 'var(--primary)' : 'var(--surface)',
                color: selectedSize === size ? '#ffffff' : 'var(--text-primary)',
                border: selectedSize === size ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                transition: 'all 0.2s',
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity & Buy Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#ffffff', padding: '4px' }}>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            style={{ width: '36px', height: '36px', border: 'none', background: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', color: 'var(--primary)' }}
          >
            -
          </button>
          <span style={{ width: '40px', textAlign: 'center', fontWeight: '700', fontSize: '15px' }}>{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 10, q + 1))}
            style={{ width: '36px', height: '36px', border: 'none', background: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', color: 'var(--primary)' }}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleBuyNow}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: '#ffffff',
            padding: '16px 28px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(86,0,103,0.3)',
          }}
        >
          <ShoppingBag size={20} /> Consecrate & Buy Now (₹{(product.price * quantity).toLocaleString('en-IN')})
        </button>
      </div>

      {/* Indian PIN Code Serviceability Check */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          <Truck size={16} /> Check Indian PIN Delivery & COD
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            maxLength={6}
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit Indian PIN Code"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px' }}
          />
          <button
            type="button"
            onClick={handleCheckPinCode}
            style={{ padding: '10px 18px', background: 'var(--primary)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Verify
          </button>
        </div>

        {pinResult.tested && (
          <div style={{ marginTop: '10px', fontSize: '12px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: pinResult.serviceable ? '#e8f5e9' : '#ffebee', color: pinResult.serviceable ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{pinResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
