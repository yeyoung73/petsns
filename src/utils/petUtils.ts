import type { Pet } from "../types/Pet";

export const convertPetData = (raw: any): Pet => ({
  id: raw.pet_id,
  name: raw.name,
  species: raw.species,
  gender: raw.gender,
  birthday: raw.birthday,
  profileImage: raw.profile_image,
  isPublic: raw.is_public,
});

export const convertPetListData = (rawList: any[]): Pet[] => {
  return rawList.map(convertPetData);
};
