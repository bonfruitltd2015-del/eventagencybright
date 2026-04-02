import type { Config, Context } from '@netlify/functions';
import { getDb, adminAuth, unauthorizedResponse } from './utils/firebase-admin.mts';
import { sendEventReminder } from './utils/email-service.mts';

export default async (req: Request, context: Context) => {
  if (!adminAuth(req)) {
    return unauthorizedResponse();
  }

  const db = getDb();

  try {
    const snapshot = await db.collection('tickets').where('status', '==', 'issued').get();
    const ticketsMap = new Map<string, any>();
    snapshot.forEach(doc => {
      const data = doc.data();
      const key = `${data.customerEmail}-${data.eventName}`;
      if (!ticketsMap.has(key)) {
        ticketsMap.set(key, data);
      }
    });
    const tickets = Array.from(ticketsMap.values());

    if (Netlify.env.get('RESEND_API_KEY')) {
      tickets.forEach(ticket => {
        sendEventReminder(ticket.customerEmail, ticket.eventName);
      });
      return Response.json({ success: true, message: `Sent ${tickets.length} reminders.` });
    } else {
      return Response.json({ error: 'RESEND_API_KEY is not configured.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error triggering event reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export const config: Config = {
  path: '/api/admin/trigger-reminders',
  method: 'POST',
};
