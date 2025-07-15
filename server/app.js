import "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import followRoutes from "./routes/follows.js";
import likeRoutes from "./routes/likes.js";
import petRoutes from "./routes/pets.js";
import reportRoutes from "./routes/report.js";
import adminRoutes from "./routes/admin.js";
import blockRoutes from "./routes/block.js";
import anniversaryRoutes from "./routes/anniversary.js";
import walkRoutes from "./routes/walk.js";

console.log("🚀 Starting PetSNS application...");
console.log("📍 Environment:", process.env.NODE_ENV);
console.log("📍 Port:", process.env.PORT);

const app = express();
const allowedOrigins = ["http://localhost:5173", "https://petsns.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use((req, res, next) => {
  console.log("▶︎ REQUEST:", req.method, req.originalUrl);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "PetSNS API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Swagger 설정
let swaggerDocument = {};
try {
  const swaggerPath = path.join(process.cwd(), "swagger-output.json");
  if (fs.existsSync(swaggerPath)) {
    const raw = fs.readFileSync(swaggerPath, "utf8");
    swaggerDocument = JSON.parse(raw);

    // 불필요한 필드 제거
    if (swaggerDocument.swagger) {
      delete swaggerDocument.swagger;
    }
    console.log("✅ Swagger 문서 로드됨");
  } else {
    console.warn("⚠️ swagger-output.json 파일이 없습니다. Swagger 비활성화됨");
  }
} catch (err) {
  console.warn("⚠️ Swagger 설정 실패:", err.message);
}

if (Object.keys(swaggerDocument).length > 0) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// API 라우트 설정
try {
  app.use("/api/likes", likeRoutes);
  app.use("/api/pets", petRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/follows", followRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/blocks", blockRoutes);
  app.use("/api/anniversaries", anniversaryRoutes);
  app.use("/api/walks", walkRoutes);
  console.log("✅ 모든 라우트 설정 완료");
} catch (err) {
  console.error("❌ 라우트 설정 실패:", err.message);
}

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error("❌ 서버 에러:", err);
  res.status(500).json({
    message: "서버 에러",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    message: "엔드포인트를 찾을 수 없습니다",
    path: req.originalUrl,
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM 신호 받음. 서버 종료 중...");
  server.close(() => {
    console.log("👋 서버가 정상적으로 종료되었습니다");
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT 신호 받음. 서버 종료 중...");
  server.close(() => {
    console.log("👋 서버가 정상적으로 종료되었습니다");
  });
});

// 예상치 못한 에러 처리
process.on("uncaughtException", (err) => {
  console.error("❌ 예상치 못한 에러:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ 처리되지 않은 Promise 거부:", reason);
  // 즉시 종료하지 않고 로그만 남김
});
