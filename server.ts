import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { createServer as createViteServer } from "vite";
import { initDatabase } from "./server/models/db";
import apiRouter from "./server/routes/api";

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

// Security & Utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for seamless SPA Vite script hydration
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Mount the MVC API Router
app.use("/api", apiRouter);

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Global Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi nội bộ máy chủ!",
    error: process.env.NODE_ENV !== "production" ? err.message : undefined
  });
});

// Bootstrap Server & Serve Frontend Views
async function startServer() {
  // Initialize Database Pool via Model layer
  await initDatabase();

  // If in development mode, register Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ENGStudy production-ready server booted on http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  });

  // Graceful Shutdown
  const shutdown = () => {
    console.log("Shutting down ENGStudy server gracefully...");
    server.close(() => {
      console.log("ENGStudy process terminated.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();
