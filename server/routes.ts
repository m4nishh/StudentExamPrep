import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for the frontend server
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      message: "Admin dashboard frontend server running",
      timestamp: new Date().toISOString()
    });
  });

  // All educational content operations will be handled by your external API
  // No local database or storage needed - pure frontend interface

  const httpServer = createServer(app);
  return httpServer;
}