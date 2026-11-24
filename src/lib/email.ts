import nodemailer from 'nodemailer';

/**
 * Professional Branded HTML Email Service (Requirement 9)
 * Uses SMTP and primary color #560067 styling
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
      <td style="padding: 10px; border-bottom: 1px solid #f0e6f2;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f0e6f2; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f0e6f2; text-align: right;">₹${item.price}</td>
    </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e9e2e9; border-radius: 14px; overflow: hidden;">
      <div style="background: ${PRIMARY_COLOR}; padding: 30px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; letter-spacing: 1px;">REHAS</h1>
        <p style="margin: 6px 0 0; color: ${GOLD_COLOR}; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Sacred Energy & Astrology Merchandise</p>
      </div>
      <div style="padding: 30px 25px; color: #292329; line-height: 1.6;">
        <h2 style="color: ${PRIMARY_COLOR}; font-size: 20px; margin-top: 0;">Order Confirmed, ${customerName}!</h2>
        <p>Thank you for choosing REHAS. Your sacred bracelet has been registered for personalized Vedic energization and will be dispatched via express courier.</p>
        
        <div style="background: #F7F1E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>Order ID:</strong> ${orderNumber}</p>
          <p style="margin: 5px 0 0; font-size: 14px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f7ebf7; color: ${PRIMARY_COLOR};">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 10px; font-weight: bold; text-align: right;">Total (INR):</td>
              <td style="padding: 12px 10px; font-weight: bold; text-align: right; color: ${PRIMARY_COLOR}; font-size: 16px;">₹${totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <p style="font-size: 13px; color: #777078;">Tracking details will be shared once your sacred package departs our Jaipur atelier.</p>
      </div>
      <div style="background: #fdfaf6; padding: 15px 20px; text-align: center; font-size: 12px; color: #777078; border-top: 1px solid #e9e2e9;">
        © ${new Date().getFullYear()} REHAS Sacred Merchandise. All rights reserved.<br />
        Support: care@rehas.in | +91 98765 43210
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[Email Mock Sent] To: ${to} | Order: ${orderNumber} | Total: ₹${totalAmount}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `Order Confirmation #${orderNumber} – REHAS Sacred Astrology Bracelets`,
      html,
    });
    return true;
  } catch (err) {
    console.error('Nodemailer error:', err);
    return false;
  }
}

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
