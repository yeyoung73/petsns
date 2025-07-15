import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PetForm from "../components/PetForm";
import { petAPI } from "../services/api";

const PetRegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (formData: FormData) => {
    try {
      setLoading(true);
      await petAPI.register(formData);
      alert("등록 완료!");
      navigate("/pets");
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 실패!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>반려동물 등록</h2>
      <PetForm
        onSubmit={handleRegister}
        isLoading={loading}
        submitLabel="등록하기"
      />
    </div>
  );
};

export default PetRegisterPage;
