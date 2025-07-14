import axios from "axios";
import type { Pet } from "../types/Pet";

export async function fetchMyPets(): Promise<Pet[]> {
  const res = await axios.get("/api/pets", { withCredentials: true });
  return res.data;
}
