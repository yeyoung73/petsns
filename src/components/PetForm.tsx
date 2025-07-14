import React, { useState } from "react";
import type { Pet } from "../types/Pet";
import styles from "./PetForm.module.css";

interface PetFormProps {
  initialData?: Pet;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  submitLabel: string;
}

const PetForm: React.FC<PetFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [species, setSpecies] = useState(initialData?.species || "");
  const [birthday, setBirthday] = useState(
    initialData?.birthday ? initialData.birthday : ""
  );
  const [gender, setGender] = useState(initialData?.gender || "female");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("이름은 필수 항목입니다.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("species", species.trim());
    formData.append("birthday", birthday);
    formData.append("gender", gender);
    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <label>
        이름 *
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label>
        종 *
        <input
          name="species"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          required
        />
      </label>

      <label>
        생년월일
        <input
          name="birthday"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
      </label>

      <label>
        성별
        <select
          name="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="male">수컷</option>
          <option value="female">암컷</option>
        </select>
      </label>

      <label>
        프로필 이미지
        <input
          name="profileImage"
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
        />
      </label>

      <button type="submit" className={styles.submitButton}>
        {isLoading ? "처리 중..." : submitLabel}
      </button>
    </form>
  );
};

export default PetForm;
