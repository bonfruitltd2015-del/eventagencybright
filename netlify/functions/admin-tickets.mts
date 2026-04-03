import type { Config, Context } from '@netlify/functions';
import { getDb, formatDoc, adminAuth, unauthorizedResponse } from './utils/firebase-admin.mts';

export default async (req: Request, context: Context) => {
  if (!adminAuth(req)) {
    return unauthorizedResponse();
  }

  const db = getDb();

  if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('tickets').orderBy('createdAt', 'desc').get();
      const tickets = snapshot.docs.map(formatDoc);
      return Response.json(tickets);
    } catch (err: any) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (req.method === 'PATCH') {
    const id = context.params.id;
    const { status } = await req.json();

    try {
      const docRef = db.collection('tickets').doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return Response.json({ error: 'Ticket not found' }, { status: 404 });
      }

      const ticket = docSnap.data() as any;
      if (status === 'used' && ticket.status === 'used') {
        return Response.json({ error: 'Ticket has already been used' }, { status: 400 });
      }

      await docRef.update({ status });
      return Response.json({ success: true });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
};

export const config: Config = {
  path: ['/api/admin/tickets', '/api/admin/tickets/:id/status'],
  method: ['GET', 'PATCH'],
};
