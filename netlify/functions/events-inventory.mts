import type { Config, Context } from '@netlify/functions';
import { getDb } from './utils/firebase-admin.mts';

export default async (req: Request, context: Context) => {
  const db = getDb();
  try {
    const snapshot = await db.collection('tickets').where('status', '==', 'issued').get();
    const inventory: Record<string, number> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.eventId) {
        inventory[data.eventId] = (inventory[data.eventId] || 0) + 1;
      }
    });
    return Response.json(inventory);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config: Config = {
  path: '/api/events/inventory',
  method: 'GET',
};
