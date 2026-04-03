import type { Config, Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { password } = await req.json();
  const adminPassword = Netlify.env.get('ADMIN_PASSWORD');

  if (!adminPassword) {
    return Response.json({ error: 'Admin password not configured on server' }, { status: 500 });
  }

  if (password === adminPassword) {
    return Response.json({ success: true, token: 'admin-token-valid' });
  } else {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }
};

export const config: Config = {
  path: '/api/admin/login',
  method: 'POST',
};
