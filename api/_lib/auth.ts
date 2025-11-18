import type { VercelRequest, VercelResponse } from '@vercel/node';

export function checkAuth(req: VercelRequest): boolean {
  const authToken = req.cookies.auth_token;
  if (!authToken) return false;
  
  try {
    const decoded = Buffer.from(authToken, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    return username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD;
  } catch {
    return false;
  }
}

export function requireAuth(handler: (req: VercelRequest, res: VercelResponse) => Promise<void> | void) {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (!checkAuth(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return handler(req, res);
  };
}
