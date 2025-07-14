import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PetForm from "../components/PetForm";
import { petAPI } from "../services/api";
import { convertPetData } from "../utils/petUtils";
import type { Pet } from "../types/Pet";

const PetEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await petAPI.getById(id!);
        const converted = convertPetData(response.data);
        setInitialData(converted);
      } catch (err) {
        alert("존재하지 않는 반려동물입니다.");
        navigate("/pets");
      }
    };
    fetchPet();
  }, [id, navigate]);

  const handleUpdate = async (formData: FormData) => {
    try {
      setLoading(true);
      await petAPI.update(id!, formData);
      alert("수정 완료!");
      navigate(`/pets/${id}`);
    } catch (err) {
      alert("수정 실패!");
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) return <p>불러오는 중...</p>;

  return (
    <div>
      <h2>반려동물 수정</h2>
      <PetForm
        initialData={initialData}
        onSubmit={handleUpdate}
        isLoading={loading}
        submitLabel="수정하기"
      />
    </div>
  );
};

export default PetEditPage;
