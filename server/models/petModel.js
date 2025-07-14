import db from "../config/db.js";

// 반려동물 등록
export async function createPet({
  ownerId,
  name,
  species,
  breed,
  gender,
  birthday,
  profileImage,
}) {
  const result = await db.query(
    `INSERT INTO petsns.pets 
     (owner_id, name, species, breed, gender, birthday, profile_image)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [ownerId, name, species, breed, gender, birthday, profileImage]
  );
  return result.rows[0];
}

// 반려동물 수정
export async function updatePetById(petId, ownerId, updates) {
  const { name, species, breed, gender, birthday, profileImage } = updates;

  const result = await db.query(
    `UPDATE petsns.pets
     SET name = $1,
         species = $2,
         breed = $3,
         gender = $4,
         birthday = $5,
         profile_image = COALESCE($6, profile_image),
         updated_at = NOW()
     WHERE pet_id = $7 AND owner_id = $8
     RETURNING *`,
    [name, species, breed, gender, birthday, profileImage, petId, ownerId]
  );

  return result.rows[0];
}

// 반려동물 상세 조회
export async function getPetById(petId, ownerId) {
  const result = await db.query(
    `SELECT * FROM petsns.pets WHERE pet_id = $1 AND owner_id = $2`,
    [petId, ownerId]
  );
  return result.rows[0];
}

export async function deletePetById(petId, userId) {
  const result = await db.query(
    `DELETE FROM petsns.pets WHERE pet_id = $1 AND owner_id = $2`,
    [petId, userId]
  );
  return result.rowCount > 0; // true면 삭제 성공
}
