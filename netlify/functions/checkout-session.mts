import type { Config, Context } from '@netlify/functions';
import Stripe from 'stripe';

export default async (req: Request, context: Context) => {
  const stripeKey = Netlify.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return Response.json({ error: 'Stripe is not configured.' }, { status: 500 });
  }

  const url = new URL(req.url);
  const session_id = url.searchParams.get('session_id');

  if (!session_id) {
    return Response.json({ error: 'session_id is required' }, { status: 400 });
  }

  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return Response.json(session);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export const config: Config = {
  path: '/api/checkout-session',
  method: 'GET',
};
