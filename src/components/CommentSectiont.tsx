import React, { useEffect, useState } from "react";
import api from "../services/api";
import CommentItem from "./CommentItem";
import styles from "./CommentSection.module.css";

interface CommentNode {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  children: CommentNode[];
}

type Props = {
  postId: number;
};

const CommentSection: React.FC<Props> = ({ postId }) => {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [newComment, setNewComment] = useState("");
  const currentUserId = Number(localStorage.getItem("user_id"));

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 클라이언트에서 트리 구조 만들기
  const buildCommentTree = (flatComments: any[]): CommentNode[] => {
    const map = new Map<number, CommentNode>();
    const roots: CommentNode[] = [];

    // 1단계: 모든 댓글을 Map에 저장
    flatComments.forEach((comment) => {
      const node: CommentNode = {
        id: comment.comment_id || comment.id,
        post_id: comment.post_id,
        parent_id: comment.parent_id ? Number(comment.parent_id) : null, // 🔥 문자열을 숫자로 변환
        user_id: comment.user_id,
        username: comment.username,
        content: comment.content,
        created_at: comment.created_at,
        is_deleted: comment.is_deleted ?? false,
        children: [],
      };
      map.set(node.id, node);
    });

    // 2단계: 부모-자식 관계 설정
    flatComments.forEach((comment) => {
      const nodeId = comment.comment_id || comment.id;
      const node = map.get(nodeId);

      if (!node) return;

      if (comment.parent_id) {
        const parentId = Number(comment.parent_id); // 🔥 문자열을 숫자로 변환
        const parent = map.get(parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // 부모가 없으면 루트로 처리 (삭제된 부모 등)
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // 3단계: 시간순 정렬 (재귀적으로)
    const sortByDate = (nodeList: CommentNode[]) => {
      nodeList.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      nodeList.forEach((node) => {
        if (node.children.length > 0) {
          sortByDate(node.children);
        }
      });
    };

    sortByDate(roots);
    return roots;
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/comments/${postId}`, {
        headers: getAuthHeaders(),
      });

      // 서버 응답을 클라이언트에서 트리로 구성
      const treeComments = buildCommentTree(res.data);
      setComments(treeComments);
    } catch (err) {
      console.error("댓글 조회 오류:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(
        "/api/comments",
        { postId, content: newComment },
        { headers: getAuthHeaders() }
      );
      setNewComment("");
      fetchComments();
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert("❌ 차단된 유저의 게시물에는 댓글을 작성할 수 없습니다.");
      } else {
        alert("⚠️ 댓글 작성에 실패했습니다.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/comments/${id}`, {
        headers: getAuthHeaders(),
      });
      fetchComments();
    } catch {
      alert("삭제 실패");
    }
  };

  const handleUpdate = async (id: number, content: string) => {
    const updated = prompt("수정할 내용을 입력하세요", content);
    if (updated) {
      try {
        await api.put(
          `/api/comments/${id}`,
          { content: updated },
          { headers: getAuthHeaders() }
        );
        fetchComments();
      } catch {
        alert("수정 실패");
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.heading}>댓글</h3>

      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          placeholder="댓글을 입력하세요"
          required
          className={styles.textarea}
        />
        <button type="submit" className={styles.submitButton}>
          작성
        </button>
      </form>

      <ul className={styles.commentList}>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onReplySuccess={fetchComments}
          />
        ))}
      </ul>
    </div>
  );
};

export default CommentSection;
