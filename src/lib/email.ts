import { Resend } from 'resend';

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

export async function sendVendorOrderNotificationEmail(params: SendVendorOrderEmailParams) {
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

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && apiKey !== 're_PLACEHOLDER') {
    try {
      const resend = new Resend(apiKey);
      const resendResponse = await resend.emails.send({
        from: 'SpiceWizz Orders <onboarding@resend.dev>',
        to: vendorEmail,
        subject: `New Order Assigned #${shortOrderId} - SpiceWizz Fulfillment`,
        html: htmlContent,
      });
      console.log(`[Vendor Notification Email] Successfully delivered via Resend to ${vendorEmail}:`, resendResponse);
      return { success: true, delivered: true, resendResponse };
    } catch (emailError: any) {
      console.error('[Vendor Notification Email] Resend API error:', emailError);
      return { success: true, delivered: false, error: emailError.message };
    }
  } else {
    console.warn('[Vendor Notification Email] RESEND_API_KEY not configured or is placeholder. Email logged to console.');
    return { success: true, delivered: false, note: 'Resend API key not configured or is placeholder' };
  }
}
