import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "./config/env.config.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { getDBStatus } from "./config/db.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: "*", // Or specific client URLs like "http://localhost:5173"
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", routes);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res, next) => {
    // If request starts with /api/, bypass serving index.html and let error handlers run
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.resolve(clientBuildPath, "index.html"));
  });
} else {
  // Base route check for development
  app.get("/", (req, res) => {
    res.json({ 
      message: "CodeTranslator API is running...",
      database: getDBStatus() ? "connected (MongoDB Atlas)" : "fallback (file-based local DB)"
    });
  });
}

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
