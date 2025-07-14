import express from "express";
import {
  submitReport,
  getAllReports,
  deleteReport,
} from "../controllers/reportController.js";
import verifyToken from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";

const router = express.Router();

router.post("/", verifyToken, submitReport);
router.get("/", verifyToken, adminOnly, getAllReports);
router.delete("/:id", verifyToken, adminOnly, deleteReport);

export default router;
