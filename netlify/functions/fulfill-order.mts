import type { Config, Context } from '@netlify/functions';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from './utils/firebase-admin.mts';
import { sendTicketConfirmation, sendMembershipConfirmation } from './utils/email-service.mts';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { type, itemId, itemName, customerEmail } = await req.json();
  const id = crypto.randomUUID();
  const db = getDb();

  try {
    if (type === 'ticket') {
      await db.collection('tickets').doc(id).set({
        id,
        eventId: itemId,
        eventName: itemName,
        customerEmail,
        status: 'issued',
        createdAt: FieldValue.serverTimestamp()
      });

      if (Netlify.env.get('RESEND_API_KEY')) {
        sendTicketConfirmation(customerEmail, itemName, id, itemId);
      }

      return Response.json({ success: true, id, type: 'ticket' });
    } else if (type === 'membership') {
      await db.collection('memberships').doc(id).set({
        id,
        customerEmail,
        status: 'active',
        createdAt: FieldValue.serverTimestamp()
      });

      if (Netlify.env.get('RESEND_API_KEY')) {
        sendMembershipConfirmation(customerEmail, id);
      }

      return Response.json({ success: true, id, type: 'membership' });
    } else {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config: Config = {
  path: '/api/fulfill-order',
  method: 'POST',
};
