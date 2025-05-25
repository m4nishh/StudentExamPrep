import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple health check endpoint for frontend
  app.get("/api/health", async (_req, res) => {
    res.json({ status: "ok", message: "Frontend admin dashboard server running" });
  });

  // All other API calls will go directly to your ngrok endpoint
  // No local database or storage needed

  const httpServer = createServer(app);
  return httpServer;
}