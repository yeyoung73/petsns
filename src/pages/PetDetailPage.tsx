import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { petAPI } from "../services/api";
import { convertPetData } from "../utils/petUtils";
import { getImageUrl } from "../config/api";
import type { Pet } from "../types/Pet";
import styles from "./PetDetailPage.module.css";

const PetDetailPage = () => {
  const { id } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const navigate = useNavigate();
  // 안전하게 수정
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await petAPI.getById(id!);
        const converted = convertPetData(response.data);
        setPet(converted);
      } catch {
        alert("존재하지 않는 반려동물입니다.");
        navigate("/pets");
      }
    };
    fetchPet();
  }, [id, navigate]);
  useEffect(() => {
    if (pet) {
      console.log("🐶 pet 상태:", pet);
      console.log("🖼 이미지 URL:", getImageUrl(pet.profileImage ?? null));
    }
  }, [pet]);
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await petAPI.delete(id!);
      alert("삭제 완료!");
      navigate("/pets");
    } catch {
      alert("삭제 실패!");
    }
  };

  if (!pet) return <p>불러오는 중...</p>;
  return (
    <div className={styles.container}>
      <h2>{pet.name}</h2>
      <img
        src={getImageUrl(pet.profileImage ?? null)}
        alt={pet.name}
        className={styles.petImage}
      />
      <p className={styles.petInfo}>종: {pet.species}</p>
      <p className={styles.petInfo}>성별: {pet.gender}</p>
      <p className={styles.petInfo}>
        생일: {pet.birthday ? pet.birthday : "미입력"}
      </p>
      <div className={styles.buttons}>
        <Link to={`/pets/${pet.id}/edit`} className={styles.detailButton}>
          수정하기
        </Link>
        <button onClick={handleDelete} className={styles.detailButton}>
          삭제하기
        </button>
      </div>
    </div>
  );
};

export default PetDetailPage;
