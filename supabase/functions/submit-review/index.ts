import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WEBHOOK_URL = "https://lwxefcnekmfnpefxyzwm.supabase.co/functions/v1/ingest/bbq-affair-rvjx1g";
const NOTIFICATION_EMAIL = "lebbqaffair@gmail.com";
const FROM_EMAIL = "BBQ Affair <bbqaffair@digital9labs.com>";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendWebhook(payload: Record<string, unknown>) {
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("Review webhook sent");
  } catch (error) {
    console.error("Failed to send review webhook:", error);
  }
}

async function sendAdminEmail(payload: {
  name: string;
  email?: string | null;
  rating: number;
  review: string;
  media?: {
    url?: string;
    resourceType?: string;
    fileName?: string;
  } | null;
}) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return;
  }

  const resend = new Resend(resendApiKey);
  const safeName = escapeHtml(payload.name);
  const safeReview = escapeHtml(payload.review);
  const safeEmail = payload.email ? escapeHtml(payload.email) : "Not provided";
  const mediaUrl = payload.media?.url;
  const mediaType = payload.media?.resourceType || "media";
  const mediaName = payload.media?.fileName ? escapeHtml(payload.media.fileName) : "Uploaded file";

  const mediaBlock = mediaUrl
    ? `
      <div style="margin-top: 20px; padding: 15px; background: #f8f8f8; border-radius: 10px;">
        <p style="margin: 0 0 10px 0;"><strong>Attached ${mediaType}:</strong> ${mediaName}</p>
        ${mediaType === "image" ? `<img src="${mediaUrl}" alt="Review attachment" style="max-width: 100%; border-radius: 8px;" />`
        : `<a href="${mediaUrl}" style="color: #c41e3a;">View ${mediaType}</a>`}
      </div>
    `
    : "";

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #c41e3a; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">📝 New Customer Review</h2>
      </div>
      <div style="padding: 20px;">
        <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin: 0 0 20px 0;"><strong>Rating:</strong> ${payload.rating}/5</p>
        <div style="background: #fff7f0; border-left: 4px solid #c41e3a; padding: 15px; border-radius: 8px;">
          <p style="margin: 0; font-weight: bold;">Review:</p>
          <p style="margin: 8px 0 0 0;">${safeReview}</p>
        </div>
        ${mediaBlock}
      </div>
      <div style="background: #333; color: #999; padding: 12px; text-align: center; font-size: 12px;">
        BBQ Affair Review Notification
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      subject: `⭐ New Review from ${payload.name}`,
      html: emailHtml,
    });
    console.log("Review email sent");
  } catch (error) {
    console.error("Failed to send review email:", error);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const name = (body?.name || "").toString().trim();
    const review = (body?.review || "").toString().trim();
    const rating = Number(body?.rating ?? 5);

    if (!name || !review) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedRating = Number.isFinite(rating) ? Math.min(Math.max(rating, 1), 5) : 5;

    const payload = {
      event: "review.submitted",
      timestamp: new Date().toISOString(),
      review: {
        name,
        email: body?.email || null,
        rating: sanitizedRating,
        review,
        media: body?.media || null,
      },
    };

    sendAdminEmail({
      name,
      email: body?.email || null,
      rating: sanitizedRating,
      review,
      media: body?.media || null,
    });
    sendWebhook(payload);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Review submission failed:", error);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
