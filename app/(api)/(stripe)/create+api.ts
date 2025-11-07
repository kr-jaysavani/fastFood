import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.json();
  const { amount } = body;
  if (!amount) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }
  const customer = await stripe.customers.create();

  const customerSession = await stripe.customerSessions.create({
    customer: customer.id,
    components: {
      mobile_payment_element: {
        enabled: true,
        features: {
          payment_method_save: "enabled",
          payment_method_redisplay: "enabled",
          payment_method_remove: "enabled",
        },
      },
    },
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // amount in cents
    currency: "usd",
    customer: customer.id,
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter
    // is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return new Response(
    JSON.stringify({
      paymentIntent: paymentIntent.client_secret,
      customerSessionClientSecret: customerSession.client_secret,
      customer: customer.id,
      publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    })
  );
}

// app.post('/payment-sheet', async (req, res) => {
//   // Use an existing Customer ID if this is a returning customer.

// });
