import type { Config, Context } from '@netlify/functions';
import Stripe from 'stripe';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const stripeKey = Netlify.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return Response.json({ error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY.' }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const { type, itemId, itemName, price, customerEmail } = await req.json();
  const appUrl = Netlify.env.get('APP_URL') || new URL(req.url).origin;

  try {
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: itemName },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=${type}&itemId=${itemId}&itemName=${encodeURIComponent(itemName)}`,
      cancel_url: `${appUrl}/cancel`,
    };

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return Response.json({ url: session.url });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export const config: Config = {
  path: '/api/create-checkout-session',
  method: 'POST',
};
