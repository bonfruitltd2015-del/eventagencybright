import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

let db: ReturnType<typeof getFirestore> | null = null;

export function getDb() {
  if (!db) {
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: 'gen-lang-client-0861359156',
      });
    }
    db = getFirestore('ai-studio-47bb81a0-8dcc-46a5-895c-1fac93091f2a');
  }
  return db;
}

export function formatDoc(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = doc.data();
  if (data.createdAt && data.createdAt.toDate) {
    data.createdAt = data.createdAt.toDate().toISOString();
  }
  return data;
}

export function adminAuth(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader === 'Bearer admin-token-valid';
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
