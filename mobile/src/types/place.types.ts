export interface PlaceResponse {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  lat: number;
  lng: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlacePayload {
  name: string;
  description?: string;
  icon?: string;
  lat: number;
  lng: number;
}
