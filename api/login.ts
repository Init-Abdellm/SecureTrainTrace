import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSessionCookie } from "./_lib/auth.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    // Vercel automatically parses JSON body, but let's be defensive
    const body = req.body || {};
    const { username, password } = body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD) {
      const cookie = createSessionCookie({ isAuthenticated: true });
      
      res.setHeader("Set-Cookie", cookie);
      return res.json({ success: true });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

