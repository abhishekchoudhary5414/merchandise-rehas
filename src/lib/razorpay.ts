import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay server-side instance securely
export function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_SECRET_KEY_ID;

  if (!key_id || !key_secret || key_id.startsWith('rzp_test_placeholder')) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Verify Razorpay payment signature server-side
 * order_id + "|" + razorpay_payment_id
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_SECRET_KEY_ID;
  if (!secret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

/**
 * Verify Razorpay webhook signature server-side
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  webhookSignature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_SECRET_KEY_ID;
  if (!webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === webhookSignature;
}
