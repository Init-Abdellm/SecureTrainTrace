import type { Express, RequestHandler } from "express";
import session from "express-session";

declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
  }
}

export function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  // Login endpoint
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD) {
      req.session.isAuthenticated = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Check auth status
  app.get('/api/auth/status', (req, res) => {
    res.json({ isAuthenticated: !!req.session.isAuthenticated });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
