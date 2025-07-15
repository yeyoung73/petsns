import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 서버 시작 시간 기록
const startTime = Date.now();

// Health check endpoint
app.get("/health", (req, res) => {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
    environment: process.env.NODE_ENV || "production",
  };

  console.log(`📨 ${new Date().toISOString()} - GET /health from ${req.ip}`);
  console.log("📨 Health check request");

  res.status(200).json(healthData);
});

// Railway용 준비성 체크
app.get("/ready", (req, res) => {
  res.status(200).json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
});

// Test API endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "PETSNS API is working!" });
});

// 서버 시작 (server 변수에 할당하여 나중에 graceful shutdown에서 사용)
console.log("🚀 === PETSNS API STARTING ===");
console.log(`📍 Node version: ${process.version}`);
console.log(`📍 Platform: ${process.platform}`);
console.log(`📍 Working directory: ${process.cwd()}`);
console.log(`📍 Environment: ${process.env.NODE_ENV || "production"}`);
console.log(`📍 Port: ${PORT}`);

if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  console.log("📍 Railway vars: {");
  console.log(
    ` RAILWAY_PUBLIC_DOMAIN: '${process.env.RAILWAY_PUBLIC_DOMAIN}',`
  );
  console.log(
    ` RAILWAY_PRIVATE_DOMAIN: '${process.env.RAILWAY_PRIVATE_DOMAIN}'`
  );
  console.log("}");
}

console.log("📦 Importing express...");
console.log("✅ Express imported successfully");
console.log(`🚀 Attempting to start server on ${HOST}:${PORT}...`);

const server = app.listen(PORT, HOST, () => {
  console.log("✅ === APP SETUP COMPLETE ===");
  console.log("✅ === SERVER SUCCESSFULLY STARTED ===");
  console.log(`🌐 Server running on ${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🧪 Test API: http://${HOST}:${PORT}/api/test`);
  console.log("✅ Production server ready for external connections");
  console.log(`🎯 Server is actively listening on ${HOST}:${PORT}`);
});

// 30초마다 서버 생존 확인
setInterval(() => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  console.log(`💓 Server alive for ${uptimeSeconds} seconds`);
}, 30000);

// 1분마다 메모리 사용량 로그
setInterval(() => {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };
  console.log(`📊 Memory usage (MB):`, memUsageMB);
}, 60000);

// Graceful shutdown 처리
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close((err) => {
      if (err) {
        console.error("❌ Error during server shutdown:", err);
        process.exit(1);
      }
      console.log("✅ Server closed successfully");
      process.exit(0);
    });

    // 10초 후 강제 종료
    setTimeout(() => {
      console.log("⏰ Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// 시그널 처리
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGQUIT", () => gracefulShutdown("SIGQUIT"));

// 예외 처리
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

// 프로세스 초기화 완료
process.nextTick(() => {
  console.log("✅ Process initialization complete");
});
