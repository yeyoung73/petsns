console.log("🚀 === APPLICATION STARTING ===");
console.log("📍 Node version:", process.version);
console.log("📍 Platform:", process.platform);
console.log("📍 Working directory:", process.cwd());
console.log("📍 Environment:", process.env.NODE_ENV);
console.log("📍 Port:", process.env.PORT);

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Add error handling for imports
console.log("📦 Starting imports...");

try {
  console.log("📦 Importing dotenv...");
  const dotenv = await import("dotenv");
  dotenv.config();
  console.log("✅ Environment configured");
} catch (err) {
  console.error("❌ Dotenv import failed:", err.message);
}

try {
  console.log("📦 Importing db config...");
  await import("./config/db.js");
  console.log("✅ DB config imported");
} catch (err) {
  console.error("❌ DB config import failed:", err.message);
  console.error("Stack:", err.stack);
  process.exit(1);
}

try {
  console.log("📦 Importing core modules...");
  const path = await import("path");
  const { fileURLToPath } = await import("url");
  const { dirname } = path;
  const express = await import("express");
  const cors = await import("cors");
  const swaggerUi = await import("swagger-ui-express");
  const fs = await import("fs");

  console.log("✅ Core modules imported");

  console.log("📦 Importing route modules...");

  // Import routes one by one to identify which one fails
  let authRoutes,
    userRoutes,
    postRoutes,
    commentRoutes,
    followRoutes,
    likeRoutes;
  let petRoutes,
    reportRoutes,
    adminRoutes,
    blockRoutes,
    anniversaryRoutes,
    walkRoutes;

  try {
    console.log("📦 Importing auth routes...");
    authRoutes = await import("./routes/auth.js");
    console.log("✅ Auth routes imported");
  } catch (err) {
    console.error("❌ Auth routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing user routes...");
    userRoutes = await import("./routes/users.js");
    console.log("✅ User routes imported");
  } catch (err) {
    console.error("❌ User routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing post routes...");
    postRoutes = await import("./routes/posts.js");
    console.log("✅ Post routes imported");
  } catch (err) {
    console.error("❌ Post routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing comment routes...");
    commentRoutes = await import("./routes/comments.js");
    console.log("✅ Comment routes imported");
  } catch (err) {
    console.error("❌ Comment routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing follow routes...");
    followRoutes = await import("./routes/follows.js");
    console.log("✅ Follow routes imported");
  } catch (err) {
    console.error("❌ Follow routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing like routes...");
    likeRoutes = await import("./routes/likes.js");
    console.log("✅ Like routes imported");
  } catch (err) {
    console.error("❌ Like routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing pet routes...");
    petRoutes = await import("./routes/pets.js");
    console.log("✅ Pet routes imported");
  } catch (err) {
    console.error("❌ Pet routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing report routes...");
    reportRoutes = await import("./routes/report.js");
    console.log("✅ Report routes imported");
  } catch (err) {
    console.error("❌ Report routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing admin routes...");
    adminRoutes = await import("./routes/admin.js");
    console.log("✅ Admin routes imported");
  } catch (err) {
    console.error("❌ Admin routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing block routes...");
    blockRoutes = await import("./routes/block.js");
    console.log("✅ Block routes imported");
  } catch (err) {
    console.error("❌ Block routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing anniversary routes...");
    anniversaryRoutes = await import("./routes/anniversary.js");
    console.log("✅ Anniversary routes imported");
  } catch (err) {
    console.error("❌ Anniversary routes import failed:", err.message);
    throw err;
  }

  try {
    console.log("📦 Importing walk routes...");
    walkRoutes = await import("./routes/walk.js");
    console.log("✅ Walk routes imported");
  } catch (err) {
    console.error("❌ Walk routes import failed:", err.message);
    throw err;
  }

  console.log("✅ All route modules imported successfully");

  console.log("⚙️ Setting up Express app...");
  const app = express.default();

  // 🔥 수정: 프론트엔드 도메인 추가
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://petsns.vercel.app",
    "https://generous-serenity-production.up.railway.app", // 실제 프론트엔드 도메인으로 변경
    process.env.FRONTEND_URL, // 환경변수로 설정 가능
  ].filter(Boolean);

  console.log("⚙️ Setting up CORS with origins:", allowedOrigins);
  app.use(
    cors.default({
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn("❌ CORS blocked origin:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  console.log("⚙️ Setting up middleware...");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Request logging
  app.use((req, res, next) => {
    console.log(
      "▶︎ REQUEST:",
      req.method,
      req.originalUrl,
      "Origin:",
      req.get("Origin")
    );
    next();
  });

  app.use(express.default.json({ limit: "10mb" }));
  app.use(express.default.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/uploads", express.default.static(path.join(__dirname, "uploads")));

  console.log("⚙️ Setting up health check routes...");

  // 🔥 수정: 기본 루트에 명확한 응답
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "🐾 PetSNS API is running successfully!",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      port: PORT,
      endpoints: {
        health: "/health",
        docs: "/api-docs",
        api: "/api/*",
      },
    });
  });

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      port: PORT,
      memory: process.memoryUsage(),
    });
  });

  // 🔥 추가: API 테스트 엔드포인트
  app.get("/api/test", (req, res) => {
    res.status(200).json({
      message: "API endpoints are working!",
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
      },
    });
  });

  console.log("⚙️ Setting up Swagger...");
  let swaggerDocument = {};
  try {
    const swaggerPath = path.join(process.cwd(), "swagger-output.json");
    if (fs.existsSync(swaggerPath)) {
      const raw = fs.readFileSync(swaggerPath, "utf8");
      swaggerDocument = JSON.parse(raw);

      if (swaggerDocument.swagger) {
        delete swaggerDocument.swagger;
      }
      console.log("✅ Swagger document loaded");
    } else {
      console.warn("⚠️ swagger-output.json not found. Swagger disabled");
    }
  } catch (err) {
    console.warn("⚠️ Swagger setup failed:", err.message);
  }

  if (Object.keys(swaggerDocument).length > 0) {
    app.use(
      "/api-docs",
      swaggerUi.default.serve,
      swaggerUi.default.setup(swaggerDocument)
    );
    console.log("✅ Swagger UI available at /api-docs");
  }

  console.log("⚙️ Setting up API routes...");

  // 🔥 수정: 라우트 순서 최적화 (더 구체적인 것부터)
  app.use("/api/auth", authRoutes.default);
  app.use("/api/users", userRoutes.default);
  app.use("/api/posts", postRoutes.default);
  app.use("/api/comments", commentRoutes.default);
  app.use("/api/likes", likeRoutes.default);
  app.use("/api/follows", followRoutes.default);
  app.use("/api/pets", petRoutes.default);
  app.use("/api/anniversaries", anniversaryRoutes.default);
  app.use("/api/walks", walkRoutes.default);
  app.use("/api/reports", reportRoutes.default);
  app.use("/api/blocks", blockRoutes.default);
  app.use("/api/admin", adminRoutes.default);

  console.log("✅ All routes configured");

  // 🔥 수정: 더 나은 에러 핸들링
  console.log("⚙️ Setting up error handlers...");

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("❌ Server error:", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    // CORS 에러 특별 처리
    if (err.message.includes("CORS")) {
      return res.status(403).json({
        error: "CORS policy violation",
        message: "Origin not allowed",
        timestamp: new Date().toISOString(),
      });
    }

    res.status(err.status || 500).json({
      error: "Internal server error",
      message:
        NODE_ENV === "development" ? err.message : "Something went wrong",
      timestamp: new Date().toISOString(),
      ...(NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  // 404 handler
  app.use("*", (req, res) => {
    console.log("❌ 404 - Endpoint not found:", req.method, req.originalUrl);
    res.status(404).json({
      error: "Endpoint not found",
      message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        "GET /",
        "GET /health",
        "GET /api/test",
        "GET /api-docs",
        "POST /api/auth/*",
        "GET /api/users/*",
        // ... 다른 엔드포인트들
      ],
    });
  });

  console.log("🚀 Starting server...");

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ === SERVER SUCCESSFULLY STARTED ===");
    console.log(`🌐 Server running on: http://0.0.0.0:${PORT}`);
    console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`🧪 API test: http://0.0.0.0:${PORT}/api/test`);
    console.log(`📚 API docs: http://0.0.0.0:${PORT}/api-docs`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔐 CORS origins: ${allowedOrigins.join(", ")}`);
  });

  // Graceful shutdown handlers
  const gracefulShutdown = (signal) => {
    console.log(`🛑 ${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("👋 Server closed successfully");
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error("❌ Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  console.log("✅ === APPLICATION FULLY STARTED ===");
} catch (err) {
  console.error("❌ === APPLICATION STARTUP FAILED ===");
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  process.exit(1);
}

// Handle unhandled errors
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", {
    promise: promise,
    reason: reason,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});
