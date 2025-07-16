// 최소한의 테스트 서버 (dotenv 없이)
console.log("🚀 Starting minimal server...");

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

console.log("⚙️ Environment check:");
console.log("PORT:", PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);

console.log("⚙️ Setting up CORS...");
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

console.log("⚙️ Setting up JSON parsing...");
app.use(express.json());

console.log("⚙️ Setting up routes...");

// 기본 라우트
app.get("/", (req, res) => {
  console.log("📥 Root route accessed");
  res.json({
    message: "🎉 Minimal server is working!",
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV,
    success: true,
  });
});

// 헬스 체크
app.get("/health", (req, res) => {
  console.log("📥 Health check accessed");
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API 테스트
app.get("/api/test", (req, res) => {
  console.log("📥 API test accessed");
  res.json({
    message: "API is working perfectly!",
    timestamp: new Date().toISOString(),
    endpoint: "/api/test",
  });
});

// 404 처리
app.use("*", (req, res) => {
  console.log("❌ 404:", req.method, req.originalUrl);
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// 에러 처리
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

console.log("🚀 Starting server on port", PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ Minimal server started successfully!");
  console.log(`🌐 Server running on: http://0.0.0.0:${PORT}`);
  console.log(`🔍 Test it: http://0.0.0.0:${PORT}/health`);
});

console.log("✅ Server setup complete");
