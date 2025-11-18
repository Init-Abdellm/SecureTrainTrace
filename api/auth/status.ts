import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "../_lib/auth";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const cookieHeader = req.headers.cookie || null;
    return res.json({ isAuthenticated: isAuthenticated(cookieHeader) });
  } catch (error: any) {
    console.error("Error in auth/status:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

