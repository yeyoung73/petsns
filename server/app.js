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

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://petsns.vercel.app", // Railway 주소로 나중에 바꿔줘
];

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

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use((req, res, next) => {
  console.log("▶︎ REQUEST:", req.method, req.originalUrl);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let swaggerDocument = {};
try {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "swagger-output.json"),
    "utf8"
  );
  swaggerDocument = JSON.parse(raw);
  if (swaggerDocument.swagger) delete swaggerDocument.swagger;
} catch (err) {
  console.warn("⚠️ swagger-output.json 파일을 읽을 수 없습니다:", err.message);
}

// ここで余分な swagger フィールドを消す
if (swaggerDocument.swagger) {
  delete swaggerDocument.swagger;
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// 에러 핸들러, 포트 리슨 등
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "서버 에러" });
});
console.log("✅ 서버 실행 시도됨");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
