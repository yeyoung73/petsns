export interface CommentNode {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  children: CommentNode[];
  is_deleted?: boolean; // ✅ 꼭 필요
  profile_image?: string;
}
