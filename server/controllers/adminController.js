// controllers/adminController.js
import db from "../config/db.js";

// 게시글 삭제
export async function deletePostByAdmin(req, res) {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM public.posts WHERE post_id = $1`, [id]);
    res.json({ message: "게시글이 삭제되었습니다" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "삭제 실패" });
  }
}

export async function deleteCommentByAdmin(req, res) {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM public.comments WHERE comment_id = $1`, [id]);
    res.json({ message: "댓글이 삭제되었습니다" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "삭제 실패" });
  }
}

export async function deleteUserByAdmin(req, res) {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM public.users WHERE user_id = $1`, [id]);
    res.json({ message: "사용자가 삭제되었습니다" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "삭제 실패" });
  }
}
