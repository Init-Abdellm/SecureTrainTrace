import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    // Simple implementation without external dependencies
    const cookieHeader = req.headers.cookie || null;
    
    let isAuthenticated = false;
    
    if (cookieHeader) {
      try {
        // Parse cookies manually
        const cookies: Record<string, string> = {};
        cookieHeader.split(";").forEach((cookie) => {
          const [name, ...rest] = cookie.trim().split("=");
          if (name && rest.length > 0) {
            cookies[name] = decodeURIComponent(rest.join("="));
          }
        });
        
        const sessionCookie = cookies["session"];
        if (sessionCookie) {
          // Simple check - if cookie exists and has valid format
          // The actual verification will be done in other endpoints
          isAuthenticated = sessionCookie.includes(".") && sessionCookie.length > 10;
        }
      } catch (e) {
        // Ignore parsing errors
        isAuthenticated = false;
      }
    }

    return res.json({ isAuthenticated });
  } catch (error: any) {
    console.error("Error in auth/status:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error?.message || "Unknown error"
    });
  }
}
