import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&deno-std=0.132.0&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?target=deno&deno-std=0.132.0&no-check";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

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
        const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const orderId = session.metadata?.order_id;

        if (orderId) {
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "confirmed"
            })
            .eq("id", orderId);
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
      line_items: line_items.map((item: any) => ({
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order_id);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
