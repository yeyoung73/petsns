#!/usr/bin/env node

// Minimal app.js for Railway testing
console.log("🚀 === PETSNS API STARTING ===");
console.log("📍 Node version:", process.version);
console.log("📍 Platform:", process.platform);
console.log("📍 Working directory:", process.cwd());
console.log("📍 Environment:", process.env.NODE_ENV);
console.log("📍 Port:", process.env.PORT);

// Test if we can import express
try {
  console.log("📦 Importing express...");
  const express = await import("express");
  console.log("✅ Express imported successfully");

  const app = express.default();

  // Basic middleware
  app.use(express.default.json());

  // Health check route
  app.get("/", (req, res) => {
    console.log("📨 Root request received");
    res.json({
      message: "PetSNS API is running!",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
    });
  });

  app.get("/health", (req, res) => {
    console.log("📨 Health check request");
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
    });
  });

  // Test API route
  app.get("/api/test", (req, res) => {
    console.log("📨 API test request");
    res.json({
      message: "API is working!",
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use((req, res) => {
    console.log("📨 404 request:", req.method, req.url);
    res.status(404).json({
      error: "Not Found",
      path: req.url,
      method: req.method,
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  });

  // Start server
  const PORT = process.env.PORT || 3000;

  console.log(`🚀 Attempting to start server on port ${PORT}...`);

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ === SERVER SUCCESSFULLY STARTED ===`);
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  });
  // 모든 요청 로깅
  app.use((req, res, next) => {
    console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  server.on("error", (err) => {
    console.error("❌ Server startup error:", err);
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("🛑 Shutdown signal received");
    server.close(() => {
      console.log("👋 Server closed gracefully");
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      console.log("⏰ Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  // Keep alive heartbeat
  setInterval(() => {
    console.log(`💓 Server alive for ${Math.floor(process.uptime())} seconds`);
  }, 60000);

  console.log("✅ === APP SETUP COMPLETE ===");
} catch (err) {
  console.error("❌ === STARTUP FAILED ===");
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  process.exit(1);
}

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
