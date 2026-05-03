export interface Hotspot {
  id: string;
  name: string;
  type: 'cafe' | 'library' | 'coworking' | 'fast_food' | 'public';
  lat: number;
  lng: number;
  address?: string;
  distance?: number;
  tags?: Record<string, string>;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
