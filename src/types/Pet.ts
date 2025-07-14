export interface Pet {
  id: number;
  name: string;
  species: string;
  gender: string;
  birthday: string;
  profileImage?: string;
  isPublic?: boolean; // ← 추가 (optional 처리)
}
