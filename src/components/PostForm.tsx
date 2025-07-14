import React, { useState, useRef } from "react";
import styles from "./PostForm.module.css";

interface Props {
  initialData?: {
    content: string;
    image: string | null;
    tags?: string[];
  };
  onSubmit: (data: FormData) => void;
}

const PostForm: React.FC<Props> = ({ initialData, onSubmit }) => {
  const [content, setContent] = useState(initialData?.content || "");
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") || ""
  );
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", content);

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    formData.append("tags", JSON.stringify(tags)); // ✅ 태그 전송

    if (fileRef.current?.files?.[0]) {
      formData.append("image", fileRef.current.files[0]);
    }

    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formWrapper}>
      <div className={styles.field}>
        <label htmlFor="content" className={styles.label}>
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="tags" className={styles.label}>
          태그 (쉼표로 구분)
        </label>
        <input
          type="text"
          id="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className={styles.input}
          placeholder="예: 고양이, 산책, 간식"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>이미지 업로드</label>
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleFileChange}
          className={styles.inputFile}
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="미리보기"
            style={{
              maxWidth: "100%",
              marginTop: "1rem",
              borderRadius: "8px",
            }}
          />
        )}
      </div>

      <div className={styles.buttons}>
        <button type="submit" className={styles.submitButton}>
          저장
        </button>
      </div>
    </form>
  );
};

export default PostForm;
