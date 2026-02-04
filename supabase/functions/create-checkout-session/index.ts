import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WEBHOOK_URL = "https://lwxefcnekmfnpefxyzwm.supabase.co/functions/v1/ingest/bbq-affair-rvjx1g";
const NOTIFICATION_EMAIL = "lebbqaffair@gmail.com";
const FROM_EMAIL = "BBQ Affair <bbqaffair@digital9labs.com>";
const LOGO_URL = "https://bbqaffair.com.sg/images/logo.png";
const SUPABASE_STORAGE_URL = "https://dndpcnyiqrtjfefpnqho.supabase.co/storage/v1/object/public/bbqaffair-images";
const ORDER_NUMBER_PREFIX = "bbqaffair";

// Get product image URL
function getProductImageUrl(imagePath: string | null) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${SUPABASE_STORAGE_URL}/${imagePath}`;
}

function formatOrderNumber(order: any) {
  const value = order?.order_number;
  if (value !== undefined && value !== null && value !== '') {
    if (typeof value === 'number') {
      return `${ORDER_NUMBER_PREFIX}${value}`;
    }
    const raw = String(value);
    if (raw.toLowerCase().startsWith(ORDER_NUMBER_PREFIX)) {
      return raw.toLowerCase();
    }
    if (/^\d+$/.test(raw)) {
      return `${ORDER_NUMBER_PREFIX}${raw}`;
    }
    return raw;
  }
  return order?.id ? order.id.slice(0, 8).toUpperCase() : '';
}

// Build items HTML helper with images
function buildItemsHtml(orderItems: any[], includeImages = false) {
  return orderItems.map(item => {
    const imageUrl = getProductImageUrl(item.product_image);
    const imageHtml = includeImages && imageUrl
      ? `<td style="padding: 12px; border-bottom: 1px solid #eee; width: 80px;">
           <img src="${imageUrl}" alt="${item.product_name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
         </td>`
      : '';

    return `
      <tr>
        ${imageHtml}
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.product_name || 'Product'}</strong>
          ${item.option_name ? `<br><span style="color: #666; font-size: 0.9em;">${item.option_name}</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price_at_time || 0).toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

// Send order notification email to business owner
// paymentStatus: 'pending' | 'paid' | 'paynow'
async function sendAdminEmail(order: any, orderItems: any[], paymentStatus: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return;
  }

  const resend = new Resend(resendApiKey);
  const itemsHtml = buildItemsHtml(orderItems);

  const isPaid = paymentStatus === 'paid';
  const isPayNow = paymentStatus === 'paynow';
  const isPending = paymentStatus === 'pending';
  const displayOrderNumber = formatOrderNumber(order);

  const statusBadge = isPaid
    ? '<span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">💳 PAID</span>'
    : isPayNow
    ? '<span style="background: #17a2b8; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">📱 PayNow - Verify Payment</span>'
    : '<span style="background: #ffc107; color: #333; padding: 4px 12px; border-radius: 20px; font-size: 12px;">⏳ AWAITING PAYMENT</span>';

  const headerColor = isPaid ? '#28a745' : isPayNow ? '#17a2b8' : '#ffc107';
  const headerEmoji = isPaid ? '✅' : isPayNow ? '📱' : '🔔';
  const headerText = isPaid ? 'Payment Received!' : isPayNow ? 'New PayNow Order' : 'New Order - Awaiting Payment';

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${headerColor}; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">${headerEmoji} ${headerText}</h2>
      </div>

      <div style="padding: 20px;">
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0;">Order #${displayOrderNumber}</h3>
            ${statusBadge}
          </div>
          <p style="margin: 5px 0;"><strong>Total:</strong> <span style="font-size: 1.3em; color: #c41e3a;">$${order.total_amount.toFixed(2)}</span></p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.payment_method === 'stripe' ? 'Credit Card (Stripe)' : 'PayNow'}</p>
        </div>

        ${isPending ? `
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #856404;"><strong>⚠️ Action Required:</strong> Customer is completing payment on Stripe. You'll receive another email once payment is confirmed.</p>
        </div>
        ` : ''}

        ${isPayNow ? `
        <div style="background: #d1ecf1; border: 1px solid #17a2b8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #0c5460;"><strong>📱 PayNow Order:</strong> Please verify payment received in your bank account before confirming this order.</p>
        </div>
        ` : ''}

        <h3 style="color: #333; border-bottom: 2px solid #c41e3a; padding-bottom: 8px;">Customer Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${order.customer_name}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${order.customer_email}">${order.customer_email}</a></td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${order.customer_phone}">${order.customer_phone}</a></td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Event Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${order.event_date}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Event Time:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${order.event_time || 'Not specified'}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Address:</strong></td><td style="padding: 8px 0;">${order.event_address}</td></tr>
        </table>

        <h3 style="color: #333; border-bottom: 2px solid #c41e3a; padding-bottom: 8px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background: #c41e3a; color: white;">
              <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
              <td style="padding: 10px; text-align: right;"><strong>$${order.total_amount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        ${order.notes ? `
        <div style="background: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; margin-top: 20px;">
          <p style="margin: 0;"><strong>📝 Customer Notes:</strong></p>
          <p style="margin: 10px 0 0 0;">${order.notes}</p>
        </div>
        ` : ''}
      </div>

      <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
        BBQ Affair Order Notification System
      </div>
    </div>
  `;

  const subjectPrefix = isPaid ? '✅ Payment Received' : isPayNow ? '📱 PayNow Order' : '🔔 New Order (Awaiting Payment)';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      subject: `${subjectPrefix} - #${displayOrderNumber} - $${order.total_amount.toFixed(2)}`,
      html: emailHtml,
    });
    console.log(`Admin email sent (${paymentStatus})`);
  } catch (error) {
    console.error("Failed to send admin email:", error);
  }
}

// Send order confirmation email to customer
async function sendCustomerEmail(order: any, orderItems: any[]) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return;
  }

  const resend = new Resend(resendApiKey);
  const itemsHtml = buildItemsHtml(orderItems, true); // Include images
  const isPayNow = order.payment_method === 'paynow';
  const PAYNOW_QR_URL = "https://bbqaffair.com.sg/images/QRCode.jpeg";
  const displayOrderNumber = formatOrderNumber(order);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">

        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); padding: 30px 20px; text-align: center;">
          <img src="${LOGO_URL}" alt="BBQ Affair" style="max-width: 180px; height: auto; margin-bottom: 10px;">
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Premium BBQ Catering in Singapore</p>
        </div>

        <!-- Success Banner -->
        <div style="background: ${isPayNow ? '#fff3cd' : '#d4edda'}; padding: 25px 20px; text-align: center; border-bottom: 3px solid ${isPayNow ? '#ffc107' : '#28a745'};">
          <div style="font-size: 50px; margin-bottom: 10px;">${isPayNow ? '📱' : '✓'}</div>
          <h1 style="color: ${isPayNow ? '#856404' : '#155724'}; margin: 0 0 10px 0; font-size: 24px;">${isPayNow ? 'Order Received - Payment Pending' : 'Order Confirmed!'}</h1>
          <p style="color: ${isPayNow ? '#856404' : '#155724'}; margin: 0; font-size: 16px;">Thank you for your order, <strong>${order.customer_name}</strong>!</p>
        </div>

        <div style="padding: 30px 25px;">

          ${isPayNow ? `
          <!-- PayNow Payment Section -->
          <div style="background: #17a2b8; color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
            <h2 style="margin: 0 0 15px 0; font-size: 20px;">📱 Complete Your Payment via PayNow</h2>
            <p style="margin: 0 0 20px 0; font-size: 14px; opacity: 0.9;">Scan the QR code below to complete your payment</p>
            <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block;">
              <img src="${PAYNOW_QR_URL}" alt="PayNow QR Code" style="width: 200px; height: 200px; object-fit: contain;">
              <p style="margin: 15px 0 5px 0; color: #333; font-size: 24px; font-weight: bold;">$${order.total_amount.toFixed(2)}</p>
              <p style="margin: 0; color: #666; font-size: 12px;">UEN: <strong>53476778L</strong></p>
            </div>
          </div>

          <!-- Important Notice for PayNow -->
          <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important Notice</h3>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li style="margin-bottom: 8px;"><strong>Your order will only be processed once we confirm your payment.</strong></li>
              <li style="margin-bottom: 8px;">Please include your <strong>Order Number #${displayOrderNumber}</strong> in the payment reference</li>
              <li>We will contact you within 24 hours to confirm receipt of payment</li>
            </ul>
          </div>
          ` : ''}

          <!-- Order Summary Box -->
          <div style="background: #fff8f0; border: 2px solid #c41e3a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%;">
              <tr>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase;">Order Number</p>
                  <p style="margin: 0; font-size: 20px; font-weight: bold; color: #333;">#${displayOrderNumber}</p>
                </td>
                <td style="text-align: right; vertical-align: top;">
                  <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase;">${isPayNow ? 'Amount Due' : 'Total Paid'}</p>
                  <p style="margin: 0; font-size: 24px; font-weight: bold; color: #c41e3a;">$${order.total_amount.toFixed(2)}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Event Details -->
          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #c41e3a; font-size: 18px; border-bottom: 2px solid #c41e3a; padding-bottom: 10px;">
              📅 Event Details
            </h2>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                  <strong style="color: #495057;">Date</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; text-align: right; color: #333;">
                  ${order.event_date}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                  <strong style="color: #495057;">Time</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; text-align: right; color: #333;">
                  ${order.event_time || 'To be confirmed'}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0;">
                  <strong style="color: #495057;">Location</strong>
                </td>
                <td style="padding: 10px 0; text-align: right; color: #333;">
                  ${order.event_address}
                </td>
              </tr>
            </table>
          </div>

          <!-- Order Items with Images -->
          <h2 style="margin: 0 0 15px 0; color: #c41e3a; font-size: 18px; border-bottom: 2px solid #c41e3a; padding-bottom: 10px;">
            🍖 Your Order
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <thead>
              <tr style="background: #c41e3a;">
                <th style="padding: 12px; text-align: left; color: white; border-radius: 8px 0 0 0;" colspan="2">Item</th>
                <th style="padding: 12px; text-align: center; color: white;">Qty</th>
                <th style="padding: 12px; text-align: right; color: white; border-radius: 0 8px 0 0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Total -->
          <div style="background: #333; color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
            <table style="width: 100%;">
              <tr>
                <td style="font-size: 16px;">Total Amount</td>
                <td style="text-align: right; font-size: 22px; font-weight: bold;">$${order.total_amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          ${order.notes ? `
          <!-- Special Notes -->
          <div style="background: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #0066cc;">📝 Special Notes</p>
            <p style="margin: 0; color: #333;">${order.notes}</p>
          </div>
          ` : ''}

          <!-- What's Next -->
          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">⏰ What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li style="margin-bottom: 8px;">We will contact you within <strong>24 hours</strong> to confirm your booking</li>
              <li style="margin-bottom: 8px;">Our team will discuss any special requirements or dietary needs</li>
              <li>You'll receive a final confirmation before your event date</li>
            </ul>
          </div>

          <!-- Contact Section -->
          <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px;">
            <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Questions about your order?</p>
            <table style="margin: 0 auto;">
              <tr>
                <td style="padding: 0 15px; text-align: center;">
                  <a href="mailto:lebbqaffair@gmail.com" style="color: #c41e3a; text-decoration: none;">
                    <div style="font-size: 24px;">✉️</div>
                    <div style="font-size: 12px;">Email Us</div>
                  </a>
                </td>
                <td style="padding: 0 15px; text-align: center;">
                  <a href="https://wa.me/6591aboratory" style="color: #25D366; text-decoration: none;">
                    <div style="font-size: 24px;">💬</div>
                    <div style="font-size: 12px;">WhatsApp</div>
                  </a>
                </td>
              </tr>
            </table>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #333; color: #999; padding: 25px; text-align: center;">
          <img src="${LOGO_URL}" alt="BBQ Affair" style="max-width: 100px; height: auto; margin-bottom: 15px; opacity: 0.8;">
          <p style="margin: 0 0 10px 0; font-size: 13px;">Premium BBQ Catering in Singapore</p>
          <p style="margin: 0; font-size: 11px; color: #666;">
            Have questions? Simply reply to this email or contact us at lebbqaffair@gmail.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = isPayNow
    ? `📱 Order Received - Payment Pending #${displayOrderNumber} - BBQ Affair`
    : `🔥 Order Confirmed! #${displayOrderNumber} - BBQ Affair`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: NOTIFICATION_EMAIL,
      to: order.customer_email,
      subject: subject,
      html: emailHtml,
    });
    console.log("Order confirmation email sent to customer:", order.customer_email);
  } catch (error) {
    console.error("Failed to send customer email:", error);
  }
}

// Send webhook notification
// paymentStatus: 'pending' | 'paid' | 'paynow'
async function sendWebhook(order: any, orderItems: any[], paymentStatus: string) {
  const eventName = paymentStatus === 'paid' ? 'order.paid'
    : paymentStatus === 'paynow' ? 'order.paynow'
    : 'order.created';

  try {
    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      order: {
        id: order.id,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        status: order.status,
        payment_method: order.payment_method,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
        },
        event: {
          date: order.event_date,
          time: order.event_time,
          address: order.event_address,
        },
        notes: order.notes,
        items: orderItems.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.price_at_time,
        })),
        created_at: order.created_at,
      }
    };

    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("Webhook sent successfully");
  } catch (error) {
    console.error("Failed to send webhook:", error);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

    const body = await req.json();

    // Handle verify-session request (for success page without webhook)
    if (body.action === "verify-session") {
      const { session_id } = body;

      if (!session_id) {
        return new Response(
          JSON.stringify({ error: "Missing session_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status === "paid") {
        // Update order in database
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const orderId = session.metadata?.order_id;

        if (orderId) {
          // Update order status
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "confirmed"
            })
            .eq("id", orderId);

          // Fetch full order details for email/webhook
          const { data: order } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          // Fetch order items with product images
          const { data: orderItems } = await supabase
            .from("order_items")
            .select(`
              *,
              product:products (
                name,
                image
              )
            `)
            .eq("order_id", orderId);

          // Enrich order items with product images
          const enrichedItems = (orderItems || []).map(item => ({
            ...item,
            product_image: item.product?.image || null,
            product_name: item.product_name || item.product?.name || 'Product'
          }));

          if (order) {
            // Send "Payment Received" emails and webhook (fire and forget)
            sendAdminEmail(order, enrichedItems, 'paid');
            sendCustomerEmail(order, enrichedItems);
            sendWebhook(order, enrichedItems, 'paid');
          }
        }

        return new Response(
          JSON.stringify({
            paid: true,
            order_id: orderId,
            amount: session.amount_total ? session.amount_total / 100 : 0
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ paid: false, status: session.payment_status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle PayNow order notification (immediate confirmation)
    if (body.action === "notify-paynow") {
      const { order_id } = body;

      if (!order_id) {
        return new Response(
          JSON.stringify({ error: "Missing order_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Fetch order details
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order_id)
        .single();

      if (!order) {
        return new Response(
          JSON.stringify({ error: "Order not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch order items with product images
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products (
            name,
            image
          )
        `)
        .eq("order_id", order_id);

      const enrichedItems = (orderItems || []).map((item: any) => ({
        ...item,
        product_image: item.product?.image || null,
        product_name: item.product_name || item.product?.name || 'Product'
      }));

      // Send PayNow emails and webhook
      sendAdminEmail(order, enrichedItems, 'paynow');
      sendCustomerEmail(order, enrichedItems);
      sendWebhook(order, enrichedItems, 'paynow');

      return new Response(
        JSON.stringify({ success: true, order_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Original create-checkout-session logic
    const { order_id, line_items, customer_email, success_url, cancel_url } = body;

    if (!order_id || !line_items || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customer_email,
      line_items: line_items.map((item: { name: string; description?: string; price: number; quantity: number }) => ({
        price_data: {
          currency: "sgd",
          product_data: {
            name: item.name,
            description: item.description || undefined,
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })),
      metadata: {
        order_id: order_id,
      },
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
    });

    // Update order with stripe session ID
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order_id);

    // Send "Awaiting Payment" email to admin
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        *,
        product:products (
          name,
          image
        )
      `)
      .eq("order_id", order_id);

    const enrichedItems = (orderItems || []).map((item: any) => ({
      ...item,
      product_image: item.product?.image || null,
      product_name: item.product_name || item.product?.name || 'Product'
    }));

    if (order) {
      // Send "Awaiting Payment" email and webhook to admin (Stripe checkout created)
      sendAdminEmail(order, enrichedItems, 'pending');
      sendWebhook(order, enrichedItems, 'pending');
    }

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
