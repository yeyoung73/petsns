// middlewares/upload.js
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("🧾 저장 경로:", "uploads/");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // 확장자 추출 (.jpg 등)
    const filename = uuidv4() + ext;
    console.log("📸 저장될 파일 이름:", filename);
    cb(null, filename);
  },
});

const upload = multer({ storage });

export default upload;
