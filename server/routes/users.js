import express from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getOtherUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";

// multer 설정
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });
const router = express.Router();

router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, upload.single("profileImage"), updateProfile);
router.delete("/me", verifyToken, deleteProfile);
router.get("/:id", verifyToken, getOtherUser);

export default router;
