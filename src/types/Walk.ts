// types/Walk.ts
export interface Walk {
  walk_id: number;
  pet_id: number;
  started_at: string; // ISO date string
  ended_at: string; // ISO date string
  distance: number; // in meters
  path: [number, number][]; // Array of [lat, lng] coordinates
  memo?: string; // Optional memo
  date: string; // Backend field name
  route: string | [number, number][]; // Backend field (can be JSON string or array)
}
