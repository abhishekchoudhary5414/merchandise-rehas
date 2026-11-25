import nodemailer from 'nodemailer';

/**
 * Professional Branded HTML Email Service
 * Uses SMTP with Vedic Luxury theme (#560067 royal purple & #D8B878 temple gold)
 */

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass || host.includes('example.com')) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

const BRAND_NAME = 'REHAS Sacred Merchandise';
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'care@rehas.in';
const PRIMARY_COLOR = '#560067';
const GOLD_COLOR = '#D8B878';

function getHeaderHtml(subHeading = 'Sacred Astrology Merchandise & Consecration') {
  return `
    <div style="background: ${PRIMARY_COLOR}; padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 2px;">REHAS</h1>
      <p style="margin: 6px 0 0; color: ${GOLD_COLOR}; font-size: 12px; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 600;">
        ${subHeading}
      </p>
    </div>
  `;
}

function getFooterHtml() {
  return `
    <div style="background: #FAF5FC; padding: 22px 20px; text-align: center; font-size: 12px; color: #777078; border-top: 1px solid #ECE3EE; line-height: 1.6;">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: ${PRIMARY_COLOR};">
        © ${new Date().getFullYear()} REHAS Sacred Merchandise. All rights reserved.
      </p>
      <p style="margin: 0; color: #8F8791;">
        Patna Sacred Atelier • REHAS, Chanakya Nagar Road, Agam Kua, Patna, Bihar, India - 800007 • Support: <a href="mailto:${FROM_EMAIL}" style="color: ${PRIMARY_COLOR}; text-decoration: none;">${FROM_EMAIL}</a> • +91 9517973153 (24 Hours)
      </p>
    </div>
  `;
}

/**
 * 1. Order Confirmed Email
 */
export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderNumber,
  totalAmount,
  items,
  paymentMethod,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  paymentMethod: string;
}) {
  const transporter = createTransporter();
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #f0e6f2;">
        <strong style="color: #292329;">${item.name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f0e6f2; text-align: center; color: #555;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #f0e6f2; text-align: right; font-weight: 600; color: ${PRIMARY_COLOR};">₹${item.price.toLocaleString('en-IN')}</td>
    </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e9e2e9; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      ${getHeaderHtml('Order Confirmed & Consecration Initiated')}
      <div style="padding: 32px 28px; color: #292329; line-height: 1.65;">
        <h2 style="color: ${PRIMARY_COLOR}; font-size: 22px; margin-top: 0; font-family: Georgia, serif;">Namaste, ${customerName}!</h2>
        <p style="font-size: 15px;">Your order has been placed successfully. Our Vedic priests are consecrating your gemstones through authentic <em>Prana-Pratishtha</em> rituals for planetary alignment.</p>
        
        <div style="background: #FDF9F4; border: 1px solid #EFE4D6; padding: 18px 20px; border-radius: 10px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14.5px;"><strong>Order ID:</strong> <span style="font-family: monospace; color: ${PRIMARY_COLOR};">${orderNumber}</span></p>
          <p style="margin: 6px 0 0; font-size: 14px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p style="margin: 6px 0 0; font-size: 14px; color: #10B981;"><strong>Status:</strong> Order Placed & Confirmed</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #FAF5FC; color: ${PRIMARY_COLOR}; border-bottom: 2px solid #EBDDF0;">
              <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Sacred Crystal</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase;">Qty</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 14px 12px; font-weight: bold; text-align: right; font-size: 15px;">Total Amount:</td>
              <td style="padding: 14px 12px; font-weight: 800; text-align: right; color: ${PRIMARY_COLOR}; font-size: 18px;">₹${totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin: 28px 0 10px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track-order?orderNumber=${orderNumber}" 
             style="background: ${PRIMARY_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
            Track Your Sacred Shipment →
          </a>
        </div>
      </div>
      ${getFooterHtml()}
    </div>
  `;

  if (!transporter) {
    console.log(`[Email Mock Sent: Order Confirmed] To: ${to} | Order: ${orderNumber} | Total: ₹${totalAmount}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `Order Confirmed #${orderNumber} – REHAS Sacred Merchandise`,
      html,
    });
    return true;
  } catch (err) {
    console.error('Nodemailer error (Order Confirmation):', err);
    return false;
  }
}

/**
 * 2. Order Status Update Email (Dispatched, Delivered, Cancelled, Refunded, Packed, etc.)
 */
export async function sendOrderStatusEmail({
  to,
  customerName,
  orderNumber,
  status,
  trackingNumber,
  trackingCourier = 'Shiprocket Express',
  amount,
  reason,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string | null;
  trackingCourier?: string | null;
  amount?: number;
  reason?: string;
}) {
  const transporter = createTransporter();
  const upper = status.toUpperCase();

  let subject = `Order Update #${orderNumber} – REHAS`;
  let title = `Update on Order #${orderNumber}`;
  let message = `Your order status has been updated.`;
  let badgeColor = PRIMARY_COLOR;
  let badgeBg = '#FAF5FC';
  let badgeBorder = '#EBDDF0';

  if (upper === 'DISPATCHED' || upper === 'SHIPPED') {
    subject = `Your Sacred Order #${orderNumber} Has Been Dispatched! 🚀`;
    title = `Order Dispatched & In Transit`;
    message = `Your consecrated merchandise has completed Vedic energization and is now on its way via ${trackingCourier || 'our express courier partner'}.`;
    badgeColor = '#1D4ED8';
    badgeBg = '#EFF6FF';
    badgeBorder = '#BFDBFE';
  } else if (upper === 'DELIVERED') {
    subject = `Order Delivered! May Divine Blessings Be With You ✨ #${orderNumber}`;
    title = `Order Delivered Successfully`;
    message = `Your consecrated Vedic bracelets have been delivered. May they bring peace, planetary harmony, and positive energy to your life.`;
    badgeColor = '#047857';
    badgeBg = '#ECFDF5';
    badgeBorder = '#A7F3D0';
  } else if (upper === 'REFUNDED') {
    subject = `Refund Processed for Order #${orderNumber} 💰 – REHAS`;
    title = `Refund Completed`;
    message = `We have processed a refund of ₹${amount ? Math.round(amount).toLocaleString('en-IN') : 'full order amount'} for your order #${orderNumber}.${reason ? ` Reason: ${reason}` : ''} Depending on your bank or payment method, the credit will reflect within 3-5 business days.`;
    badgeColor = '#B91C1C';
    badgeBg = '#FEF2F2';
    badgeBorder = '#FECACA';
  } else if (upper === 'CANCELLED') {
    subject = `Order #${orderNumber} Has Been Cancelled – REHAS`;
    title = `Order Cancelled`;
    message = `Your order #${orderNumber} has been cancelled.${reason ? ` Reason: ${reason}` : ''} If any payment was deducted, a refund will be processed immediately.`;
    badgeColor = '#991B1B';
    badgeBg = '#FEF2F2';
    badgeBorder = '#FECACA';
  } else if (upper === 'PACKED') {
    subject = `Your Order #${orderNumber} Has Been Packed & Energized`;
    title = `Order Packed with Vedic Care`;
    message = `Your gemstone bracelets have been ritually cleansed, mantra-infused, and packed in luxury velvet pouches ready for courier dispatch.`;
  }

  const statusLabel = status.replaceAll('_', ' ');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e9e2e9; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      ${getHeaderHtml(title)}
      <div style="padding: 32px 28px; color: #292329; line-height: 1.65;">
        <h2 style="color: ${PRIMARY_COLOR}; font-size: 22px; margin-top: 0; font-family: Georgia, serif;">Namaste, ${customerName}!</h2>
        <p style="font-size: 15px;">${message}</p>
        
        <div style="background: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #777; display: block; margin-bottom: 4px;">CURRENT STATUS</span>
          <strong style="color: ${badgeColor}; font-size: 20px; text-transform: uppercase;">${statusLabel}</strong>
          ${amount ? `<div style="margin-top: 6px; font-weight: 700; color: ${PRIMARY_COLOR}; font-size: 16px;">Amount: ₹${Math.round(amount).toLocaleString('en-IN')}</div>` : ''}
        </div>

        ${trackingNumber ? `
          <div style="background: #FDF9F4; border: 1px solid #EFE4D6; padding: 16px 20px; border-radius: 10px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px;"><strong>Courier Partner:</strong> ${trackingCourier || 'Shiprocket Express'}</p>
            <p style="margin: 5px 0 0; font-size: 14px;"><strong>Tracking AWB Number:</strong> <span style="font-family: monospace; color: ${PRIMARY_COLOR}; font-weight: bold;">${trackingNumber}</span></p>
          </div>
        ` : ''}

        <div style="text-align: center; margin: 28px 0 10px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track-order?orderNumber=${orderNumber}" 
             style="background: ${PRIMARY_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
            View Order & Real-Time Tracking →
          </a>
        </div>
      </div>
      ${getFooterHtml()}
    </div>
  `;

  if (!transporter) {
    console.log(`[Email Mock Sent: ${statusLabel}] To: ${to} | Order: ${orderNumber} | Details: ${message}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error(`Status email error (${status}):`, error);
    return false;
  }
}

/**
 * 3. Customer Contact Notification
 */
export async function sendContactNotification({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const transporter = createTransporter();
  console.log(`[Contact Form] From: ${name} (${email}) - ${subject}: ${message}`);
  if (!transporter) return true;

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME} Contact Portal" <${FROM_EMAIL}>`,
      to: FROM_EMAIL,
      replyTo: email,
      subject: `[Customer Inquiry] ${subject} - ${name}`,
      html: `
        <h3>New Contact Message Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f7f1e8; padding: 15px; border-radius: 8px;">${message}</p>
      `,
    });
    return true;
  } catch (e) {
    console.error('Contact notification error:', e);
    return false;
  }
}
