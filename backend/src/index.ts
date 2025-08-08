import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// API routes
app.get("/api", (req, res) => {
  res.json({
    message: "Quote Management API - NZ Market",
    version: "1.0.0",
    status: "running",
  });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({
      status: "Database connected successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// Sample quotes endpoint
app.get("/api/quotes", async (req, res) => {
  try {
    // For now, return sample data since database might not be connected
    const sampleQuotes = [
      {
        id: "1",
        quoteNumber: "QT-2024-0001",
        title: "Website Development",
        customer: "ABC Company",
        status: "SENT",
        total: 2500,
        currency: "NZD",
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        quoteNumber: "QT-2024-0002",
        title: "Mobile App Development",
        customer: "XYZ Ltd",
        status: "ACCEPTED",
        total: 5000,
        currency: "NZD",
        createdAt: "2024-01-10",
      },
    ];

    res.json({
      success: true,
      data: sampleQuotes,
      message: "Sample quotes retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    // eslint-disable-next-line no-console
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  },
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      // eslint-disable-next-line no-console
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
      // eslint-disable-next-line no-console
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to start server:", error);
    // eslint-disable-next-line no-console
    console.log("⚠️  Starting server without database connection...");

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(
        `🚀 Server running on http://localhost:${PORT} (without database)`,
      );
      // eslint-disable-next-line no-console
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      // eslint-disable-next-line no-console
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
      // eslint-disable-next-line no-console
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  // eslint-disable-next-line no-console
  console.log("\n🛑 Shutting down server...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  // eslint-disable-next-line no-console
  console.log("\n🛑 Shutting down server...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
