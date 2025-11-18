import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSessionCookie } from "./_lib/auth";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD) {
    const cookie = createSessionCookie({ isAuthenticated: true });
    
    res.setHeader("Set-Cookie", cookie);
    return res.json({ success: true });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
}

