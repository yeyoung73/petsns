console.log("🚀 === APPLICATION STARTING ===");
console.log("📍 Node version:", process.version);
console.log("📍 Platform:", process.platform);
console.log("📍 Working directory:", process.cwd());
console.log("📍 Environment:", process.env.NODE_ENV);
console.log("📍 Port:", process.env.PORT);

// Add error handling for imports
console.log("📦 Starting imports...");

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

  const allowedOrigins = ["http://localhost:5173", "https://public.vercel.app"];

  console.log("⚙️ Setting up CORS...");
  app.use(
    cors.default({
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

  console.log("⚙️ Setting up middleware...");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  app.use((req, res, next) => {
    console.log("▶︎ REQUEST:", req.method, req.originalUrl);
    next();
  });

  app.use(express.default.json());
  app.use(express.default.urlencoded({ extended: true }));
  app.use("/uploads", express.default.static(path.join(__dirname, "uploads")));

  console.log("⚙️ Setting up health check...");
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
  }

  console.log("⚙️ Setting up API routes...");
  app.use("/api/likes", likeRoutes.default);
  app.use("/api/pets", petRoutes.default);
  app.use("/api/posts", postRoutes.default);
  app.use("/api/auth", authRoutes.default);
  app.use("/api/users", userRoutes.default);
  app.use("/api/comments", commentRoutes.default);
  app.use("/api/follows", followRoutes.default);
  app.use("/api/reports", reportRoutes.default);
  app.use("/api/admin", adminRoutes.default);
  app.use("/api/blocks", blockRoutes.default);
  app.use("/api/anniversaries", anniversaryRoutes.default);
  app.use("/api/walks", walkRoutes.default);
  console.log("✅ All routes configured");

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
  });

  console.log("⚙️ Setting up error handlers...");
  app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);
    res.status(500).json({
      message: "서버 에러",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      message: "엔드포인트를 찾을 수 없습니다",
      path: req.originalUrl,
    });
  });

  console.log("🚀 Starting server...");
  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server successfully started on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
  });

  // Keep the process alive
  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      console.log("👋 Server closed");
    });
  });

  process.on("SIGINT", () => {
    console.log("🛑 SIGINT received. Shutting down gracefully...");
    server.close(() => {
      console.log("👋 Server closed");
    });
  });

  console.log("✅ === APPLICATION FULLY STARTED ===");
} catch (err) {
  console.error("❌ === APPLICATION STARTUP FAILED ===");
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
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
