import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { petAPI } from "../services/api";
import { convertPetData } from "../utils/petUtils";
import { getImageUrl } from "../config/api";
import type { Pet } from "../types/Pet";
import styles from "./PetListPage.module.css";

const PetListPage: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await petAPI.getAll();
        const converted = response.data.map(convertPetData);
        setPets(converted);
      } catch (error) {
        console.error("Failed to fetch pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) return <p>불러오는 중...</p>;

  return (
    <div className={styles.container}>
      <h2>내 반려동물 목록</h2>
      {pets.length === 0 ? (
        <p>등록된 반려동물이 없습니다.</p>
      ) : (
        <ul className={styles.petList}>
          {pets.map((pet) => (
            <li key={pet.id} className={styles.petItem}>
              <Link to={`/pets/${pet.id}`} className={styles.petLink}>
                <img
                  className={styles.petImage}
                  src={getImageUrl(pet.profileImage ?? null)}
                  alt={pet.name}
                />
                <h3>{pet.name}</h3>
                <p>{pet.species}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PetListPage;
