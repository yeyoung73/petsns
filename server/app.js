#!/usr/bin/env node

// Minimal app.js for Railway testing
console.log("🚀 === PETSNS API STARTING ===");
console.log("📍 Node version:", process.version);
console.log("📍 Platform:", process.platform);
console.log("📍 Working directory:", process.cwd());
console.log("📍 Environment:", process.env.NODE_ENV);
console.log("📍 Port:", process.env.PORT);
console.log("📍 Railway vars:", {
  RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN,
  RAILWAY_PRIVATE_DOMAIN: process.env.RAILWAY_PRIVATE_DOMAIN,
});

// Test if we can import express
try {
  console.log("📦 Importing express...");
  const express = await import("express");
  console.log("✅ Express imported successfully");

  const app = express.default();

  // Basic middleware
  app.use(express.default.json());

  // 모든 요청 로깅
  app.use((req, res, next) => {
    console.log(
      `📨 ${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`
    );
    next();
  });

  // Health check route (빠른 응답을 위해 간소화)
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
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: process.env.PORT,
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
  const HOST = "0.0.0.0";

  console.log(`🚀 Attempting to start server on ${HOST}:${PORT}...`);

  const server = app.listen(PORT, HOST, () => {
    console.log(`✅ === SERVER SUCCESSFULLY STARTED ===`);
    console.log(`🌐 Server running on ${HOST}:${PORT}`);
    console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
    console.log(`🧪 Test API: http://${HOST}:${PORT}/api/test`);

    // Railway 환경에서 서버가 준비되었음을 알림
    if (process.env.NODE_ENV === "production") {
      console.log(`✅ Production server ready for external connections`);
    }
  });

  server.on("error", (err) => {
    console.error("❌ Server startup error:", err);
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  // 서버가 실제로 리스닝 중인지 확인
  server.on("listening", () => {
    const addr = server.address();
    console.log(
      `🎯 Server is actively listening on ${addr.address}:${addr.port}`
    );
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`🛑 Shutdown signal received: ${signal}`);
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

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Keep alive heartbeat (더 자주 체크)
  setInterval(() => {
    const uptime = Math.floor(process.uptime());
    console.log(`💓 Server alive for ${uptime} seconds`);
  }, 30000);

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
