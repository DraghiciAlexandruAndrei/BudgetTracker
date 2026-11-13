
import "dotenv/config";
// Load environment variables from .env file
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";


import { connectDatabase } from "./config/database.js";

const app = express();
// Load environment variables from .env file
const PORT = Number(process.env.PORT ?? 5000);
const CLIENT_URL =
  process.env.CLIENT_URL ?? "http://localhost:5173";

// Security and middleware configuration
app.use(helmet());
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
// API health check
app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "BudgetTracker API is running!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// Start application after database connection
async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(
        `BudgetTracker API running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start BudgetTracker:", error);
    process.exitCode = 1;
  }
}

void startServer();
