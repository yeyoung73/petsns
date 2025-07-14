// server/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("토큰이 없음");
    return res.status(401).json({ message: "토큰이 없습니다." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "토큰이 유효하지 않습니다.",
        error: err.message,
      });
    }
    req.user = decoded;
    next();
  });
};

export default verifyToken;
