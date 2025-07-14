import type { Pet } from "../types/Pet";

export const convertPetData = (petData: any): Pet => ({
  id: petData.pet_id,
  name: petData.name,
  species: petData.species,
  gender: petData.gender,
  birthday: petData.birthday,
  profileImage: petData.profile_image,
});
