export type Anniversary = {
  anniversary_id: number;
  pet_id: number;
  title: string;
  date: string; // ISO 날짜 문자열
  memo?: string;
  image?: string;
};
