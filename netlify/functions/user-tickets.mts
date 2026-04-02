import type { Config, Context } from '@netlify/functions';
import { getDb, formatDoc } from './utils/firebase-admin.mts';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const db = getDb();
  try {
    const snapshot = await db.collection('tickets').where('customerEmail', '==', email).orderBy('createdAt', 'desc').get();
    const tickets = snapshot.docs.map(formatDoc);
    return Response.json(tickets);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config: Config = {
  path: '/api/user/tickets',
  method: 'GET',
};
