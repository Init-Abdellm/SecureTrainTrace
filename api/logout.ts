import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearSessionCookie } from "./_lib/auth.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const cookie = clearSessionCookie();
  res.setHeader("Set-Cookie", cookie);
  return res.json({ success: true });
}

