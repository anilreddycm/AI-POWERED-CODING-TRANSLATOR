import express from "express";
import cors from "cors";
import "./config/env.config.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { getDBStatus } from "./config/db.config.js";

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

// Base route check
app.get("/", (req, res) => {
  res.json({ 
    message: "CodeTranslator API is running...",
    database: getDBStatus() ? "connected (MongoDB Atlas)" : "fallback (file-based local DB)"
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
