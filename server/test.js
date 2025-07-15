#!/usr/bin/env node

console.log("🚀 === MINIMAL TEST APP STARTING ===");
console.log("📍 Node version:", process.version);
console.log("📍 Platform:", process.platform);
console.log("📍 Working directory:", process.cwd());
console.log("📍 Command line args:", process.argv);
console.log("📍 Environment variables:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  PORT:", process.env.PORT);
console.log("  PWD:", process.env.PWD);

// Test basic imports
try {
  console.log("📦 Testing express import...");
  const express = await import("express");
  console.log("✅ Express imported successfully");

  const app = express.default();

  app.get("/", (req, res) => {
    console.log("📨 Request received at /");
    res.json({
      message: "Minimal test app working!",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.get("/health", (req, res) => {
    console.log("📨 Health check request");
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  const PORT = process.env.PORT || 3000;

  console.log(`🚀 Attempting to start server on port ${PORT}...`);

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ === SERVER SUCCESSFULLY STARTED ON PORT ${PORT} ===`);
    console.log(`🌐 Test URL: http://localhost:${PORT}/`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });

  server.on("error", (err) => {
    console.error("❌ Server error:", err);
  });

  // Keep alive
  setInterval(() => {
    console.log(`💓 Server alive for ${Math.floor(process.uptime())} seconds`);
  }, 30000);

  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received");
    server.close(() => {
      console.log("👋 Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("🛑 SIGINT received");
    server.close(() => {
      console.log("👋 Server closed");
      process.exit(0);
    });
  });
} catch (err) {
  console.error("❌ === STARTUP FAILED ===");
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  process.exit(1);
}

// Handle unhandled errors
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

console.log("✅ === TEST APP SETUP COMPLETE ===");
