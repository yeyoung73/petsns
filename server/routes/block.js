import express from "express";
import {
  handleBlockUser,
  getBlockedUsers,
} from "../controllers/blockController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, handleBlockUser);
router.get("/", verifyToken, getBlockedUsers);

export default router;
