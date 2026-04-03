import type { Config, Context } from '@netlify/functions';
import { getDb, formatDoc, adminAuth, unauthorizedResponse } from './utils/firebase-admin.mts';
import { sendMembershipStatusUpdate } from './utils/email-service.mts';

export default async (req: Request, context: Context) => {
  if (!adminAuth(req)) {
    return unauthorizedResponse();
  }

  const db = getDb();

  if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('memberships').orderBy('createdAt', 'desc').get();
      const memberships = snapshot.docs.map(formatDoc);
      return Response.json(memberships);
    } catch (err: any) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (req.method === 'PATCH') {
    const id = context.params.id;
    const { status } = await req.json();

    try {
      const docRef = db.collection('memberships').doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return Response.json({ error: 'Membership not found' }, { status: 404 });
      }

      const membership = docSnap.data() as any;
      await docRef.update({ status });

      if (Netlify.env.get('RESEND_API_KEY')) {
        sendMembershipStatusUpdate(membership.customerEmail, status);
      }

      return Response.json({ success: true });
    } catch (error) {
      console.error('Error updating membership status:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
};

export const config: Config = {
  path: ['/api/admin/memberships', '/api/admin/memberships/:id/status'],
  method: ['GET', 'PATCH'],
};
