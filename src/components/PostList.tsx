// components/PostList.tsx
import React from "react";
import FeedPost from "./FeedPost";
import type { Post } from "../types/Post";
import styles from "./PostList.module.css";

type Props = {
  posts: Post[];
  onTagClick?: (tag: string) => void; // 👈 이것도 추가!
};

const PostList: React.FC<Props> = ({ posts, onTagClick }) => {
  return (
    <div className={styles.postListContainer}>
      {posts.map((post) => (
        <FeedPost key={post.post_id} post={post} onTagClick={onTagClick} />
      ))}
    </div>
  );
};

export default PostList;
