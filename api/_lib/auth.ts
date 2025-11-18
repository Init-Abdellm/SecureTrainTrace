import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "session";
const SECRET = process.env.SESSION_SECRET || "change-this-secret";

export interface SessionData {
  isAuthenticated: boolean;
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length > 0) {
      cookies[name] = decodeURIComponent(rest.join("="));
    }
  });
  
  return cookies;
}

function sign(value: string, secret: string): string {
  const hmac = createHmac("sha256", secret);
  hmac.update(value);
  const signature = hmac.digest("hex");
  return `${value}.${signature}`;
}

function unsign(value: string, secret: string): string | null {
  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return null;
  
  const data = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);
  
  const expected = sign(data, secret).split(".")[1];
  
  // Use timing-safe comparison
  if (expected.length !== signature.length) return null;
  
  try {
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return data;
    }
  } catch {
    return null;
  }
  
  return null;
}

export function getSession(cookieHeader: string | null): SessionData | null {
  if (!cookieHeader) return null;
  
  const cookies = parseCookies(cookieHeader);
  const sessionCookie = cookies[COOKIE_NAME];
  
  if (!sessionCookie) return null;
  
  try {
    const unsigned = unsign(sessionCookie, SECRET);
    if (!unsigned) return null;
    
    return JSON.parse(unsigned) as SessionData;
  } catch {
    return null;
  }
}

export function createSessionCookie(data: SessionData): string {
  const signed = sign(JSON.stringify(data), SECRET);
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;
  const secureFlag = isProduction ? "Secure" : "";
  return `${COOKIE_NAME}=${signed}; HttpOnly; ${secureFlag}; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function isAuthenticated(cookieHeader: string | null): boolean {
  const session = getSession(cookieHeader);
  return session?.isAuthenticated === true;
}

