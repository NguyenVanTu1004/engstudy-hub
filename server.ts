import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDatabase } from "./server/models/db";
import apiRouter from "./server/routes/api";

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount the MVC API Router
app.use("/api", apiRouter);

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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ENGStudy server booted on http://localhost:${PORT}`);
    console.log(`🌐 Production environment: ${process.env.NODE_ENV === "production"}`);
  });
}

startServer();
