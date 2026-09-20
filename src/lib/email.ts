import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface VendorOrderItemSummary {
  name: string;
  quantity: number;
  price: number;
}

export interface SendVendorOrderEmailParams {
  vendorEmail: string;
  vendorName: string;
  businessName: string;
  orderId: string;
  orderDate?: Date | string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderNote?: string;
  items: VendorOrderItemSummary[];
  baseUrl?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  delivered: boolean;
  provider: 'smtp' | 'resend' | 'none';
  messageId?: string;
  error?: string;
  note?: string;
  details?: any;
}

/**
 * Universal email delivery engine supporting SMTP (Nodemailer) and Resend.
 * Priority:
 * 1. SMTP if SMTP_HOST, SMTP_USER, and SMTP_PASS are configured.
 * 2. Resend if RESEND_API_KEY is configured and valid.
 * 3. Graceful failure reporting if no provider is configured.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, from } = options;

  // 1. Check SMTP credentials
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const defaultFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || `SpiceWizz <${smtpUser}>`;
      const mailOptions = {
        from: from || defaultFrom,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Delivered via SMTP to ${to}. MessageId: ${info.messageId}`);
      return {
        success: true,
        delivered: true,
        provider: 'smtp',
        messageId: info.messageId,
        details: info,
      };
    } catch (smtpError: any) {
      console.error('[Email Service] SMTP delivery failed:', smtpError);
      // If Resend is not configured, return SMTP error immediately
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey || apiKey === 're_PLACEHOLDER') {
        return {
          success: false,
          delivered: false,
          provider: 'smtp',
          error: `SMTP error: ${smtpError.message}`,
        };
      }
      console.log('[Email Service] Attempting fallback to Resend API...');
    }
  }

  // 2. Check Resend credentials
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && resendApiKey !== 're_PLACEHOLDER') {
    try {
      const resend = new Resend(resendApiKey);
      const resendFrom =
        from ||
        process.env.RESEND_FROM_EMAIL ||
        process.env.EMAIL_FROM ||
        'SpiceWizz Orders <orders@spicewizz.com>';

      const response = await resend.emails.send({
        from: resendFrom,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''),
      });

      // Resend Node SDK v2/v3/v6 returns { data, error } and does NOT throw on API errors
      if (response.error) {
        console.error('[Email Service] Resend API error response:', response.error);
        return {
          success: false,
          delivered: false,
          provider: 'resend',
          error: `Resend error (${response.error.name || 'API'}): ${response.error.message}`,
          details: response.error,
        };
      }

      console.log(`[Email Service] Delivered via Resend to ${to}. ID: ${response.data?.id}`);
      return {
        success: true,
        delivered: true,
        provider: 'resend',
        messageId: response.data?.id,
        details: response.data,
      };
    } catch (resendError: any) {
      console.error('[Email Service] Resend SDK exception:', resendError);
      return {
        success: false,
        delivered: false,
        provider: 'resend',
        error: `Resend exception: ${resendError.message}`,
      };
    }
  }

  // 3. No email service configured
  const errorMsg = 'Email service not configured. Please provide SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) or a valid RESEND_API_KEY in .env.';
  console.warn(`[Email Service] ${errorMsg}`);
  return {
    success: false,
    delivered: false,
    provider: 'none',
    error: errorMsg,
  };
}

export async function sendVendorOrderNotificationEmail(params: SendVendorOrderEmailParams): Promise<SendEmailResult> {
  const {
    vendorEmail,
    vendorName,
    businessName,
    orderId,
    orderDate,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    orderNote,
    items,
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  } = params;

  const shortOrderId = orderId.substring(orderId.length - 8).toUpperCase();
  const formattedDate = orderDate
    ? new Date(orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const vendorTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const portalUrl = `${baseUrl}/vendor/orders`;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f0eee6; font-size: 14px; color: #1c1c18; font-weight: 500;">
        ${item.name}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f0eee6; font-size: 14px; color: #44483b; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f0eee6; font-size: 14px; color: #44483b; text-align: right;">
        ₹${item.price.toLocaleString('en-IN')}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f0eee6; font-size: 14px; color: #1c1c18; font-weight: 700; text-align: right;">
        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const fullAddress = [
    shippingAddress?.street,
    shippingAddress?.city,
    shippingAddress?.state,
    shippingAddress?.postalCode,
    shippingAddress?.country
  ].filter(Boolean).join(', ');

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 28px; background-color: #fcf9f2; color: #1c1c18;">
      
      <!-- Brand Header -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #486413; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">SpiceWizz</h1>
        <p style="color: #855300; font-size: 12px; margin: 4px 0 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Vendor Partner Dispatch Notice</p>
      </div>

      <!-- Main Box -->
      <div style="background-color: #ffffff; padding: 28px; border-radius: 16px; box-shadow: 0 4px 12px -2px rgba(0,0,0,0.06); border: 1px solid #eee7db;">
        
        <!-- Order Badge Banner -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0eee6; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <span style="background-color: #ffedd5; color: #c2410c; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; font-family: monospace;">
              ORDER #${shortOrderId}
            </span>
            <p style="font-size: 13px; color: #757969; margin: 6px 0 0 0;">Assigned on ${formattedDate}</p>
          </div>
          <div style="text-align: right;">
            <span style="background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px;">
              Ready for Fulfillment
            </span>
          </div>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #33382c; margin-top: 0;">
          Hello <strong>${businessName || vendorName}</strong>,
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #33382c;">
          The store administrator has assigned you a new customer order. Please review the shipment destination and items below to prepare the package for dispatch.
        </p>

        <!-- Customer & Destination Card -->
        <div style="background-color: #faf8f3; border: 1px solid #eadecb; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #855300; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">
            📦 Customer Shipping Destination
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1c1c18;">
            ${customerName}
          </p>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #55594b;">
            <strong>Email:</strong> ${customerEmail} ${customerPhone ? `&bull; <strong>Phone:</strong> ${customerPhone}` : ''}
          </p>
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #33382c;">
            <strong>Address:</strong> ${fullAddress || 'No physical address specified'}
          </p>
          ${orderNote ? `
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #d5cbb8; font-size: 13px; color: #78350f;">
              <strong>Customer Note:</strong> "${orderNote}"
            </div>
          ` : ''}
        </div>

        <!-- Ordered Items Table -->
        <h4 style="margin: 24px 0 12px 0; color: #1c1c18; font-size: 14px; font-weight: 700;">
          Items to Fulfill (${items.length} ${items.length === 1 ? 'Product' : 'Products'}):
        </h4>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #faf8f3; text-align: left;">
              <th style="padding: 10px 16px; font-size: 12px; color: #757969; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #eadecb;">Product</th>
              <th style="padding: 10px 16px; font-size: 12px; color: #757969; font-weight: 600; text-transform: uppercase; text-align: center; border-bottom: 1px solid #eadecb;">Qty</th>
              <th style="padding: 10px 16px; font-size: 12px; color: #757969; font-weight: 600; text-transform: uppercase; text-align: right; border-bottom: 1px solid #eadecb;">Unit Price</th>
              <th style="padding: 10px 16px; font-size: 12px; color: #757969; font-weight: 600; text-transform: uppercase; text-align: right; border-bottom: 1px solid #eadecb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 14px 16px; text-align: right; font-weight: 700; color: #1c1c18; font-size: 14px;">
                Your Order Subtotal:
              </td>
              <td style="padding: 14px 16px; text-align: right; font-weight: 800; color: #486413; font-size: 16px;">
                ₹${vendorTotal.toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${portalUrl}" style="background: linear-gradient(135deg, #486413 0%, #607d2b 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(72,100,19,0.25);">
            Open Vendor Orders Dashboard &rarr;
          </a>
        </div>

        <p style="font-size: 13px; color: #757969; text-align: center; margin: 0;">
          Log in to your vendor dashboard to Accept the order and update shipping &amp; tracking details.
        </p>

      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #757969;">
        <p style="margin: 0 0 4px 0;">SpiceWizz Marketplace &bull; Admin Order Dispatch Service</p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} SpiceWizz. All rights reserved.</p>
      </div>

    </div>
  `;

  console.log(`\n========================================`);
  console.log(`[Vendor Notification Email] Dispatching to: ${vendorEmail}`);
  console.log(`Order ID: #${shortOrderId} | Customer: ${customerName} | Items: ${items.length}`);
  console.log(`Portal Link: ${portalUrl}`);
  console.log(`========================================\n`);

  return sendEmail({
    to: vendorEmail,
    subject: `New Order Assigned #${shortOrderId} - SpiceWizz Fulfillment`,
    html: htmlContent,
  });
}

export interface SendAdminEnquiryEmailParams {
  enquiryId?: string;
  product: string;
  name: string;
  email: string;
  country: string;
  company?: string;
  phone?: string;
  quantity: string;
  grade?: string;
  packaging?: string;
  message: string;
  adminEmails?: string[];
  baseUrl?: string;
}

export async function sendAdminEnquiryNotificationEmail(params: SendAdminEnquiryEmailParams): Promise<SendEmailResult> {
  const {
    enquiryId,
    product,
    name,
    email,
    country,
    company,
    phone,
    quantity,
    grade,
    packaging,
    message,
    adminEmails,
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  } = params;

  // Resolve admin destination emails
  const recipients: string[] = [];
  if (adminEmails && adminEmails.length > 0) {
    recipients.push(...adminEmails);
  }
  if (process.env.ADMIN_EMAIL) {
    const parsed = process.env.ADMIN_EMAIL.split(',').map(e => e.trim()).filter(Boolean);
    recipients.push(...parsed);
  }
  if (recipients.length === 0 && process.env.SMTP_USER) {
    recipients.push(process.env.SMTP_USER);
  }
  if (recipients.length === 0) {
    recipients.push('admin@spicewizz.com');
  }

  // Deduplicate and filter valid emails
  const uniqueRecipients = Array.from(new Set(recipients.filter(e => e && e.includes('@'))));
  const primaryRecipient = uniqueRecipients.join(', ');

  const dashboardUrl = `${baseUrl}/admin/enquiries`;
  const replyMailto = `mailto:${email}?subject=${encodeURIComponent(`SpiceWizz Enquiry - ${product} (${quantity})`)}`;
  const dateFormatted = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background-color: #0d0d0c; color: #f5f5f4;">
      
      <!-- Brand Header -->
      <div style="text-align: center; margin-bottom: 24px; padding: 12px 0;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #f59e0b; display: block; margin-bottom: 6px;">
          URGENT BUSINESS LEAD
        </span>
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">
          New Purchase Enquiry
        </h1>
        <p style="color: #a8a29e; font-size: 13px; margin: 6px 0 0 0;">
          Received on ${dateFormatted}
        </p>
      </div>

      <!-- Main Container Card -->
      <div style="background-color: #171717; padding: 28px; border-radius: 16px; border: 1px solid #292524; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Summary Banner -->
        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #f59e0b; font-weight: 700;">Target Commodity</div>
            <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 2px;">${product}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #f59e0b; font-weight: 700;">Requested Volume</div>
            <div style="font-size: 20px; font-weight: 800; color: #fbbf24; margin-top: 2px;">${quantity}</div>
          </div>
        </div>

        <!-- Buyer Contact Details -->
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #d6d3d1; margin: 0 0 12px 0; border-bottom: 1px solid #292524; padding-bottom: 8px;">
          Prospective Buyer Profile
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #a8a29e; width: 120px;">Contact Name:</td>
            <td style="padding: 8px 0; color: #ffffff; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a8a29e;">Email:</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${email}" style="color: #f59e0b; text-decoration: none; font-weight: 600;">${email}</a>
            </td>
          </tr>
          ${company ? `
          <tr>
            <td style="padding: 8px 0; color: #a8a29e;">Company:</td>
            <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${company}</td>
          </tr>` : ''}
          ${phone ? `
          <tr>
            <td style="padding: 8px 0; color: #a8a29e;">Phone / WhatsApp:</td>
            <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${phone}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; color: #a8a29e;">Destination Country:</td>
            <td style="padding: 8px 0; color: #ffffff; font-weight: 600;">${country}</td>
          </tr>
          ${grade ? `
          <tr>
            <td style="padding: 8px 0; color: #a8a29e;">Grade / Spec:</td>
            <td style="padding: 8px 0; color: #ffffff;">${grade}</td>
          </tr>` : ''}
          ${packaging ? `
          <tr>
            <td style="padding: 8px 0; color: #a8a29e;">Packaging:</td>
            <td style="padding: 8px 0; color: #ffffff;">${packaging}</td>
          </tr>` : ''}
        </table>

        <!-- Buyer Message -->
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #d6d3d1; margin: 0 0 10px 0; border-bottom: 1px solid #292524; padding-bottom: 8px;">
          Requirement &amp; Message
        </h3>
        <div style="background-color: #0c0a09; border: 1px solid #292524; border-radius: 10px; padding: 14px; font-size: 14px; line-height: 1.6; color: #e7e5e4; margin-bottom: 28px; white-space: pre-wrap;">
${message}
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000; padding: 13px 26px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; margin-right: 8px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);">
            Open in Admin Dashboard &rarr;
          </a>
          <a href="${replyMailto}" style="background-color: #262626; color: #ffffff; border: 1px solid #404040; padding: 13px 22px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
            Reply to Buyer
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #78716c;">
        <p style="margin: 0 0 4px 0;">Malabar Coast Spices / SpiceWizz Admin Notification Service</p>
        <p style="margin: 0;">This notification was triggered automatically by a user enquiry submission.</p>
      </div>

    </div>
  `;

  console.log(`\n========================================`);
  console.log(`[Admin Enquiry Notification] Sending to: ${primaryRecipient}`);
  console.log(`Product: ${product} | Qty: ${quantity} | From: ${name} (${country})`);
  console.log(`Dashboard Link: ${dashboardUrl}`);
  console.log(`========================================\n`);

  return sendEmail({
    to: primaryRecipient,
    subject: `🔔 New Purchase Enquiry: ${product} (${quantity}) from ${name}`,
    html: htmlContent,
  });
}

