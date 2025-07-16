// middlewares/upload.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// 🔥 uuid import 수정
let uuid;
try {
  // ES module 방식으로 import
  const uuidModule = await import("uuid");
  uuid = uuidModule.v4;
} catch (error) {
  console.warn("⚠️ UUID package not found, using fallback");
  // UUID 대신 간단한 랜덤 ID 생성
  uuid = () => Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    // 파일명: uuid + 확장자
    const ext = path.extname(file.originalname);
    const filename = uuid() + ext;
    cb(null, filename);
  },
});

// 파일 필터 (이미지만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("이미지 파일만 업로드 가능합니다."));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter: fileFilter,
});

export default upload;
