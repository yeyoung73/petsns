import * as followModel from "../models/followModel.js";

export const toggleFollow = async (req, res) => {
  // ✅ JWT 토큰에서 userId로 저장됨
  const followerId = req.user?.userId;
  const followingId = Number(req.params.userId);

  console.log("🔍 followerId:", followerId, "followingId:", followingId);

  if (!followerId || isNaN(followingId)) {
    return res.status(400).json({ message: "유효하지 않은 요청입니다." });
  }

  try {
    const isAlreadyFollowing = await followModel.isFollowing(
      followerId,
      followingId
    );
    if (isAlreadyFollowing) {
      await followModel.deleteFollow(followerId, followingId); // ✅ followModel로 수정
    } else {
      await followModel.createFollow(followerId, followingId); // ✅ followModel로 수정
    }
    res.json({ message: "팔로우 토글 성공" });
  } catch (err) {
    console.error("팔로우 처리 실패:", err);
    res.status(500).json({ message: "팔로우 처리 실패" });
  }
};

export const checkFollowStatus = async (req, res) => {
  // ✅ JWT 토큰에서 userId로 저장됨
  const followerId = req.user?.userId;
  const followingId = Number(req.params.userId);

  try {
    console.log("🔍 req.user:", req.user);
    console.log("🔍 target user:", req.params.userId);

    if (!followerId || isNaN(followingId)) {
      return res.status(400).json({ message: "유효하지 않은 요청입니다." });
    }

    const isFollowing = await followModel.isFollowing(followerId, followingId);
    res.json({ followed: isFollowing }); // ✅ 프론트엔드에서 사용하는 키와 일치
  } catch (err) {
    console.error("팔로우 상태 확인 실패:", err);
    res.status(500).json({ message: "팔로우 상태 확인 실패" });
  }
};

export const getFollowCounts = async (req, res) => {
  const userId = Number(req.params.userId); // ✅ 일관성 있게 Number로 변환

  try {
    console.log("🔍 follow count 요청 userId:", userId);

    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    const [followers, following] = await Promise.all([
      followModel.countFollowers(userId),
      followModel.countFollowing(userId),
    ]);

    res.json({ followerCount: followers, followingCount: following }); // ✅ 프론트엔드에서 사용하는 키와 일치
  } catch (err) {
    console.error("팔로우 수 조회 실패:", err);
    res.status(500).json({ message: "팔로우 수 조회 실패" });
  }
};
