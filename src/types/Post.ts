export interface Post {
  post_id: number;
  content: string;
  image: string | null;
  created_at: string;
  user_id: number;
  username: string;
  tags?: string[];
  is_deleted?: boolean;
}
