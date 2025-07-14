export default function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "관리자만 접근할 수 있습니다." });
  }
  next();
}
