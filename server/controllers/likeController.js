import {
  addLike,
  removeLike,
  countLikes,
  hasUserLiked,
} from "../models/likeModel.js";

export const likePost = async (req, res) => {
  console.log("🔐 req.user:", req.user);
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;
    await addLike(userId, postId);
    res.status(200).json({ message: "좋아요 완료" });
  } catch (err) {
    res.status(500).json({ message: "좋아요 실패", error: err.message });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;
    await removeLike(userId, postId);
    res.status(200).json({ message: "좋아요 취소 완료" });
  } catch (err) {
    res.status(500).json({ message: "취소 실패", error: err.message });
  }
};

export const getLikeCount = async (req, res) => {
  try {
    const postId = req.params.postId;
    const count = await countLikes(postId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "카운트 실패", error: err.message });
  }
};

export const checkIfLiked = async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;
    const liked = await hasUserLiked(userId, postId);
    res.json({ liked });
  } catch (err) {
    res.status(500).json({ message: "확인 실패", error: err.message });
  }
};
